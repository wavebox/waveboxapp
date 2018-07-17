import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import KeychainScene from './KeychainScene'
import querystring from 'querystring'
import { MuiThemeProvider } from '@material-ui/core/styles'
import MaterialThemeOnly from 'wbui/Themes/MaterialThemeOnly'

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
      <MuiThemeProvider theme={MaterialThemeOnly}>
        <KeychainScene serviceName={serviceName} apiKey={apiKey} openMode={openMode} />
      </MuiThemeProvider>
    )
  }
}
