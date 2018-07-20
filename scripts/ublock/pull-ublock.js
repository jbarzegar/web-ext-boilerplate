const path = require('path');
const c = require('child_process');
const { promisify } = require('util');

const fs = require('fs-extra');
const rf = require('rimraf');
const logger = require('consola');
const ora = require('ora');
const cheerio = require('cheerio');

const Git = require('nodegit');

const exec = promisify(c.exec);
const rimraf = promisify(rf);

const repoUrl = 'https://github.com/gorhill/uBlock';
const ublockAssetsUrl = 'https://github.com/uBlockOrigin/uAssets';

const { uBlockVersion } = fs.readJSONSync(
  path.resolve(__dirname, '..', '..', 'package.json')
);

// Dirs
const tmp = path.resolve(__dirname, '..', '..', 'tmp');
const ublockTmp = path.resolve(tmp, 'uBlock');
const ublockAssetsTmp = path.resolve(tmp, 'uAssets');

const publicDir = path.resolve(
  __dirname,
  '..',
  '..',
  'public',
  'ublock',
  'core'
);
const addonsDir = path.resolve(publicDir, '..', '..', 'addons');

const assetsFile = path.resolve(publicDir, 'assets', 'assets.json');

const cloneProject = async () => {
  const spinner = ora(`Cloning ublock v${uBlockVersion}`);
  try {
    spinner.start();
    await Git.Clone(repoUrl, '.');
    await Git.Clone(ublockAssetsUrl, ublockAssetsTmp);

    const repo = await Git.Repository.open(ublockTmp);

    spinner.stop();
    console.clear(); // eslint-disable-line

    logger.success('Pulled ublock repo');

    logger.info('checking out tag');
    // Checkout version
    const tag = await repo.getReferenceCommit(uBlockVersion);
    await repo.setHeadDetached(tag.sha());

    logger.success(`Successfully checked out version ${uBlockVersion}`);

    return;
  } catch (e) {
    spinner.stop();
    throw e;
  }
};

const buildUblock = async () => {
  // Run the build
  const filesToMove = ['LICENSE.txt', 'README.md'];
  const filesToRemove = ['popup.html', 'background.html', 'manifest.json'];

  logger.start('Building webextension');

  try {
    await exec('tools/make-webext.sh');

    // Move the build into public/ublock
    await fs.move('dist/build/uBlock0.webext', publicDir);

    filesToMove.forEach(name => fs.copyFile(name, path.join(publicDir, name)));
    filesToRemove.forEach(name => fs.remove(path.resolve(publicDir, name)));

    logger.success('Webextension build');
    return;
  } catch (e) {
    logger.error('Failed to build webextension');
    throw e;
  }
};

const addWSblockLists = async () => {
  // Load json fil;e
  const oldAssetsFile = await fs.readJson(assetsFile);

  const wsList = {
    easylist: {
      content: 'filters',
      group: 'ads',
      title: 'EasyList',
      contentURL: [
        'https://assets.windscribe.com/extension/easylist.txt',
        'https://assets.staticnetcontent.com/extension/easylist.txt'
      ],
      supportURL: 'https://forums.lanik.us/'
    },
    easyprivacy: {
      content: 'filters',
      group: 'privacy',
      title: 'EasyPrivacy',
      contentURL: [
        'https://assets.windscribe.com/extension/easyprivacy.txt',
        'https://assets.staticnetcontent.com/extension/easyprivacy.txt'
      ],
      supportURL: 'https://forums.lanik.us/'
    },
    'fanboy-social': {
      content: 'filters',
      group: 'social',
      title: 'Fanboy’s Social Blocking List',
      contentURL: [
        'https://assets.windscribe.com/extension/fanboy-social.txt',
        'https://assets.staticnetcontent.com/extension/fanboy-social.txt'
      ],
      supportURL: 'https://forums.lanik.us/'
    }
  };

  // merge new ws list
  const a = { ...oldAssetsFile, ...wsList };

  return fs.writeJSON(assetsFile, a, { spaces: 2 });
};

const modifyUboTemplates = async () => {
  // const ublockDir = await fs.readdir()
  // Read ublock directory
  const dir = await fs.readdir(publicDir);
  const templates = dir.filter(file => path.extname(file) === '.html');

  const injectAddonScripts = async filename => {
    const ext = path.extname(filename);
    const name = filename.split(ext)[0];
    const addonFilePath = path.resolve(addonsDir, `${name}-addons.js`);

    if (fs.existsSync(addonFilePath)) {
      const templateBuffer = await fs.readFile(
        path.resolve(publicDir, filename),
        'utf8'
      );

      const $ = cheerio.load(templateBuffer);

      $('body').append(`
        <script src="browser-polyfill.min.js"></script>
        <script src="addons/${name}-addons.js"></script>
      `);

      await fs.writeFile(path.join(publicDir, filename), $.html());
    }
  };

  templates.forEach(injectAddonScripts);
};

const cleanup = () => rimraf(tmp);

const init = async () => {
  if (fs.existsSync(tmp)) {
    rimraf(tmp);
  }
  rimraf(publicDir);

  await fs.ensureDir(ublockTmp);
};

module.exports = async ({ exit = true } = {}) => {
  if (exit) {
    process.on('beforeExit', () => {
      logger.log('Process exiting.');
      process.exit();
    });
  }

  return init()
    .then(
      () =>
        fs.existsSync(ublockTmp) && fs.existsSync(ublockAssetsTmp)
          ? rimraf(publicDir)
          : Promise.resolve()
    )
    .then(() => process.chdir(ublockTmp))
    .then(cloneProject)
    .then(buildUblock)
    .then(addWSblockLists)
    .then(modifyUboTemplates)
    .then(cleanup)
    .catch(err => {
      logger.error(err);
      cleanup();
      if (exit) process.exit();
    });
};
