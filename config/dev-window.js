/* global chrome */
const removeListeners = () =>
  new Promise((resolve, reject) => {
    try {
      chrome.contextMenus.remove('OPEN_DEV_WINDOW', () => resolve())
    } catch (e) {
      resolve()
    }
  })

removeListeners().then(() => {
  chrome.contextMenus.create({
    id: 'OPEN_DEV_WINDOW',
    title: 'Open development window',
    onclick: () => chrome.windows.create({ type: 'popup', url: 'window.html' })
  })
})
