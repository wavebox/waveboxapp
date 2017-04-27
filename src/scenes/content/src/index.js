import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import browserActions from 'stores/browser/browserActions'
import injectTapEventPlugin from 'react-tap-event-plugin'

browserActions.load()
injectTapEventPlugin()
ReactDOM.render(<Provider />, document.getElementById('ReactComponent-AppScene'))
