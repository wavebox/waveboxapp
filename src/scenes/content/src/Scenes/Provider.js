import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import THEME_MAPPING from 'wbui/Themes/ThemeMapping'
import { MuiThemeProvider } from '@material-ui/core/styles'
import BrowserScene from './BrowserScene'
import { settingsStore } from 'stores/settings'

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

  render () {
    const { url, partition } = this.props
    const { theme } = this.state

    return (
      <MuiThemeProvider theme={THEME_MAPPING[theme]}>
        <BrowserScene url={url} partition={partition} />
      </MuiThemeProvider>
    )
  }
}
