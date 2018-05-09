import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
//import Theme from 'sharedui/Components/Theme'
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import MonitorScene from './MonitorScene'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return <MonitorScene />
    /*return (
      <MuiThemeProvider muiTheme={Theme}>
        <MonitorScene />
      </MuiThemeProvider>
    )*/
  }
}
