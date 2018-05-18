import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { MuiThemeProvider } from '@material-ui/core/styles'
import Theme from 'wbui/Theme'
import AppScene from './AppScene'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <MuiThemeProvider theme={Theme}>
        <AppScene />
      </MuiThemeProvider>
    )
  }
}
