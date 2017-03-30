const React = require('react')
const ReactDOM = require('react-dom')
const Provider = require('Scenes/Provider')

const browserActions = require('stores/browser/browserActions')

browserActions.load()

const injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

ReactDOM.render(<Provider />, document.getElementById('ReactComponent-AppScene'))
