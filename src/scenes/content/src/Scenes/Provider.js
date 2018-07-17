import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import DarkTheme from 'wbui/Themes/DarkTheme'
import LightTheme from 'wbui/Themes/LightTheme'
import { MuiThemeProvider } from '@material-ui/core/styles'
import BrowserScene from './BrowserScene'
import { settingsStore } from 'stores/settings'
import UISettings from 'shared/Models/Settings/UISettings'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string.isRequired,
    partition: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    theme: settingsStore.getState().ui.theme
  }

  settingsChanged = (settingsState) => {
    this.setState({
      theme: settingsState.ui.theme
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Gets the theme class from the provided theme value
  * @param theme: the theme to pick
  * @return the theme class
  */
  renderTheme (theme) {
    switch (theme) {
      case UISettings.THEMES.DARK: return DarkTheme
      case UISettings.THEMES.LIGHT: return LightTheme
      default: return DarkTheme
    }
  }

  render () {
    const { url, partition } = this.props
    const { theme } = this.state

    return (
      <MuiThemeProvider theme={this.renderTheme(theme)}>
        <BrowserScene url={url} partition={partition} />
      </MuiThemeProvider>
    )
  }
}
