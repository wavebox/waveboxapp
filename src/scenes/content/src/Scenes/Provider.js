import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Theme from 'sharedui/Components/Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import BrowserScene from './BrowserScene'
import querystring from 'querystring'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { url, partition } = querystring.parse(window.location.search.slice(1))

    return (
      <MuiThemeProvider muiTheme={Theme}>
        <BrowserScene url={url} partition={partition} />
      </MuiThemeProvider>
    )
  }
}
