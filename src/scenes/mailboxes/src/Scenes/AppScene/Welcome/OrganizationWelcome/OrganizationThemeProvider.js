import React from 'react'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import deepEqual from 'fast-deep-equal'
import OrganizationWelcome from './OrganizationWelcome'
import MaterialUIThemeProps from 'wbui/Themes/MaterialUIThemeProps'

class OrganizationThemeProvider extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      rawTheme: userState.user.ows.theme
    }
  })()

  userChanged = (userState) => {
    this.setState({
      rawTheme: userState.user.ows.theme
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare({ props: this.props, state: null }, nextProps, null) ||
      deepEqual(this.state.rawTheme, nextState.rawTheme) === false
  }

  render () {
    const { rawTheme } = this.state
    const theme = createMuiTheme({
      ...MaterialUIThemeProps,
      ...rawTheme
    })

    return (
      <MuiThemeProvider theme={theme}>
        <OrganizationWelcome />
      </MuiThemeProvider>
    )
  }
}

export default OrganizationThemeProvider
