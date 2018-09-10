import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { MuiThemeProvider } from '@material-ui/core/styles'
import MaterialThemeOnly from 'wbui/Themes/MaterialThemeOnly'
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
      <MuiThemeProvider theme={MaterialThemeOnly}>
        <AppScene />
      </MuiThemeProvider>
    )
  }
}
