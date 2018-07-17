import React from 'react'
import SidelistMailboxes from './SidelistMailboxes'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistWindowControls from './SidelistWindowControls'
import SidelistControls from './SidelistControls'
import SidelistUpgradePlans from './SidelistUpgradePlans'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => {
  return {
    container: {
      backgroundColor: ThemeTools.getValue(theme, 'wavebox.sidebar.backgroundColor'),
      boxShadow: ThemeTools.getValue(theme, 'wavebox.sidebar.boxShadow'),
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column'
    },
    mailboxes: {
      flexGrow: 10000,
      overflowY: 'auto'
    }
  }
}

@withStyles(styles, { withTheme: true })
class Sidelist extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const userState = userStore.getState()
    return {
      showTitlebar: settingsState.launched.ui.showTitlebar,
      showPlans: userState.user.showPlansInSidebar
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      showPlans: userState.user.showPlansInSidebar
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showTitlebar, showPlans } = this.state
    const { className, classes, theme, ...passProps } = this.props

    return (
      <div
        {...passProps}
        className={classNames(classes.container, 'WB-Sidelist', className)}>
        {!showTitlebar ? (<SidelistWindowControls />) : undefined}
        {showPlans ? (<SidelistUpgradePlans />) : undefined}
        <SidelistMailboxes className={classes.mailboxes} />
        <SidelistControls />
      </div>
    )
  }
}

export default Sidelist
