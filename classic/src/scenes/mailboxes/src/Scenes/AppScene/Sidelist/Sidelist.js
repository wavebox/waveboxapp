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
import ToolbarContextMenu from 'Components/ToolbarContextMenu'

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
      flexGrow: 10000
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
      showPlans: userState.user.showPlansInSidebar,
      contextMenuAnchor: null
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      showPlans: userState.user.showPlansInSidebar
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * @param evt: the event that fired
  */
  handleOpenContextMenu = (evt) => {
    this.setState({
      contextMenuAnchor: {
        anchor: evt.target,
        anchorPosition: { top: evt.clientY, left: evt.clientX }
      }
    })
    if (this.props.onContextMenu) {
      this.props.onContextMenu(evt)
    }
  }

  /**
  * @param evt: the event that fired
  */
  handleCloseContextMenu = () => {
    this.setState({ contextMenuAnchor: null })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, classes, theme, onContextMenu, ...passProps } = this.props
    const { showTitlebar, showPlans, contextMenuAnchor } = this.state

    return (
      <div
        {...passProps}
        onContextMenu={this.handleOpenContextMenu}
        className={classNames(classes.container, 'WB-Sidelist', className)}>
        {!showTitlebar ? (<SidelistWindowControls />) : undefined}
        {showPlans ? (<SidelistUpgradePlans />) : undefined}
        <SidelistMailboxes className={classes.mailboxes} />
        <SidelistControls />
        <ToolbarContextMenu
          location='sidebar'
          {...(contextMenuAnchor ? {
            isOpen: true,
            anchor: contextMenuAnchor.anchor,
            anchorPosition: contextMenuAnchor.anchorPosition
          } : {
            isOpen: false
          })}
          onRequestClose={this.handleCloseContextMenu} />
      </div>
    )
  }
}

export default Sidelist
