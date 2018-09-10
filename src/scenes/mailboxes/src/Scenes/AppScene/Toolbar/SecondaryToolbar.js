import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import ToolbarNavigation from './ToolbarNavigation'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import { TOOLBAR_AUTO_SPLIT_THRESHOLD } from 'shared/constants'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  toolbar: {
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.toolbar.backgroundColor'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  navigation: {
    width: '100%'
  }
})

@withStyles(styles, { withTheme: true })
class SecondaryToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired
  }

  /**
  * Works out if the active servie has the navigation toolbar in the toolbar
  * @param accountState: the mailbox state
  * @return true if there are navigation controls
  */
  static hasNavigationInToolbar (accountState) {
    const mailbox = accountState.activeMailbox()
    const service = accountState.activeService()
    if (!mailbox || !service) { return false }

    if (service.hasNavigationToolbar) {
      if (mailbox.navigationBarUiLocation === ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.SECONDARY_TOOLBAR) {
        return true
      } else if (mailbox.navigationBarUiLocation === ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.AUTO) {
        if (mailbox.toolbarStartServices.length + mailbox.toolbarEndServices.length > TOOLBAR_AUTO_SPLIT_THRESHOLD) {
          return true
        }
      }
    }

    return false
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()

    return {
      ...this.deriveAccountState(accountState)
    }
  })()

  accountUpdated = (accountState) => {
    this.setState(this.deriveAccountState(accountState))
  }

  /**
  * Derives the account state from the stores
  * @param accountState: the current account store state
  * @return state update
  */
  deriveAccountState (accountState) {
    const mailbox = accountState.activeMailbox()
    return {
      activeTabId: accountState.getActiveWebcontentTabId(),
      serviceId: accountState.activeServiceId(),
      ...(mailbox ? {
        mailboxId: mailbox.id,
        navigationBarUiLocation: mailbox.navigationBarUiLocation
      } : {
        mailboxId: undefined,
        navigationBarUiLocation: ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.AUTO
      })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      style,
      toolbarHeight,
      className,
      classes,
      theme,
      ...passProps
    } = this.props
    const {
      mailboxId,
      serviceId,
      activeTabId
    } = this.state

    return (
      <div
        {...passProps}
        className={classNames(
          classes.toolbar,
          'WB-Navigation-Toolbar',
          className
        )}
        style={{ height: toolbarHeight, ...style }}>
        <ToolbarNavigation
          className={classes.navigation}
          tabId={activeTabId}
          toolbarHeight={toolbarHeight}
          mailboxId={mailboxId}
          serviceId={serviceId} />
      </div>
    )
  }
}

export default SecondaryToolbar
