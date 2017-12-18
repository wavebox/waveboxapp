import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import Theme from 'sharedui/Components/Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import BrowserScene from './BrowserScene'
import { remote } from 'electron'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string.isRequired,
    partition: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    remote.getCurrentWindow().on('focus', this.handleWindowFocused)
  }

  componentWillUnmount () {
    remote.getCurrentWindow().removeListener('focus', this.handleWindowFocused)
  }

  /* **************************************************************************/
  // Window events
  /* **************************************************************************/

  /**
  * Handles the window focusing
  */
  handleWindowFocused = () => {
    // (Thomas101)We shouldn't use dom manipulation, but for this simple window
    // it's overkill for anything - consider removing this in the future when
    // this gets more complex
    const element = document.querySelector('webview')
    if (element) { element.focus() }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { url, partition } = this.props

    return (
      <MuiThemeProvider muiTheme={Theme}>
        <BrowserScene url={url} partition={partition} />
      </MuiThemeProvider>
    )
  }
}
