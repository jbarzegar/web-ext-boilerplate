/* Create Iframe for background inspection */

const el = document.createElement('iframe')

el.src = `${window.location.origin}/background.html`

el.id = 'WEB_EXT_BACKGROUND_FRAME'

el.height = 0
el.width = 0

document.body.appendChild(el)
