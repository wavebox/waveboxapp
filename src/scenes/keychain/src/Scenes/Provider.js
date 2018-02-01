import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Theme from 'sharedui/Components/Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import KeychainScene from './KeychainScene'
import querystring from 'querystring'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const qs = querystring.parse(window.location.search.substr(1))
    return {
      serviceName: qs.service,
      apiKey: qs.key,
      openMode: qs.openMode
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceName, openMode, apiKey } = this.state
    return (
      <MuiThemeProvider muiTheme={Theme}>
        <KeychainScene serviceName={serviceName} apiKey={apiKey} openMode={openMode} />
      </MuiThemeProvider>
    )
  }
}
