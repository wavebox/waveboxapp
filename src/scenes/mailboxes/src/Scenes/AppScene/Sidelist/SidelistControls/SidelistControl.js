import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Menu } from '@material-ui/core'
import { settingsActions, settingsStore, Tour } from 'stores/settings'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import PrimaryTooltip from 'wbui/PrimaryTooltip'

const styles = (theme) => ({
  // Icon
  container: {
    textAlign: 'center',
    WebkitAppRegion: 'no-drag'
  },
  button: {
    backgroundColor: 'transparent !important',
    height: 32,
    width: 32,
    padding: 0
  },

  // Tour content
  popoverPopper: {
    zIndex: 1200
  },
  popoverContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  popoverButtonContainer: {
    paddingLeft: 32
  },
  nextPopoverButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    border: `2px solid ${ThemeTools.getValue(theme, 'wavebox.tourPopover.color')}`,
    padding: '8px 16px',
    borderRadius: 4,
    fontSize: '11px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  quitPopoverButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    border: `2px solid ${ThemeTools.getValue(theme, 'wavebox.tourPopover.color')}`,
    padding: '8px 16px',
    borderRadius: 4,
    fontSize: '11px',
    textAlign: 'center',
    opacity: 0.7,
    cursor: 'pointer'
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControl extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.element.isRequired,
    tooltip: PropTypes.node.isRequired,
    tourStep: PropTypes.oneOf(Object.keys(Tour.TOUR_STEPS)),
    tourTooltip: PropTypes.node,
    ContextMenuComponent: PropTypes.func
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    this.dismissingTourTO = null
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    clearTimeout(this.dismissingTourTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      hasSeenTour: settingsState.hasSeenTour,
      currentTourStep: settingsState.tourStep,
      dismissingTour: false,
      contextMenuAnchor: null,
      tooltipOpen: false
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      hasSeenTour: settingsState.hasSeenTour,
      currentTourStep: settingsState.tourStep
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Dismisses a tour popover gracefully
  * @param progressionFn: a function to call when the popover is no longer active
  */
  dismissTourPopover = (progressionFn) => {
    this.setState({ dismissingTour: true })
    clearTimeout(this.dismissingTourTO)
    this.dismissingTourTO = setTimeout(() => {
      progressionFn()
      clearTimeout(this.dismissingTourTO)
      this.dismissingTourTO = setTimeout(() => {
        this.setState({ dismissingTour: false })
      }, 250)
    }, 250)
  }

  /**
  * Handles the user progressing the tour
  * @param evt: the event that fired
  */
  handleTourNext = (evt) => {
    this.dismissTourPopover(() => settingsActions.tourNext())
  }

  /**
  * Handles the user quitting the tour
  * @param evt: the event that fired
  */
  handleTourQuit = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.dismissTourPopover(() => settingsActions.tourQuit())
  }

  /**
  * Opens the context menu
  * @param evt: the event that fired
  */
  handleOpenContextMenu = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState({
      contextMenuAnchor: evt.target,
      tooltipOpen: false
    })
    if (this.props.onContextMenu) {
      this.props.onContextMenu(evt)
    }
  }

  /**
  * Hides the context menu
  * @param evt: the event that fired
  * @param cb=undefined: callback to execute on complete
  */
  handleHideContextMenu = (evt, cb = undefined) => {
    this.setState({ contextMenuAnchor: null })
    if (typeof (cb) === 'function') {
      setTimeout(() => { cb() }, 250)
    }
  }

  /**
  * Handles opening the tooltip
  * @param evt: the event that fired
  */
  handleCloseTooltip = (evt) => {
    this.setState({ tooltipOpen: false })
  }

  /**
  * Handles closing the tooltip
  * @param evt: the event that fired
  */
  handleOpenTooltip = (evt) => {
    this.setState({ tooltipOpen: true })
  }

  /**
  * Handles the icon being clicked
  * @param evt: the event that fired
  */
  handleIconClick = (evt) => {
    this.setState({ tooltipOpen: false })
    if (this.props.onClick) {
      this.props.onClick(evt)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the tooltip content for the tour
  * @param classes: the classes
  * @param tourTooltip: the tooltip content
  * @return jsx
  */
  renderTourTooltipContent (classes, tourTooltip) {
    if (!tourTooltip) { return undefined }
    return (
      <div className={classes.popoverContentContainer} onClick={this.handleTourNext}>
        {tourTooltip}
        <div className={classes.popoverButtonContainer}>
          <div className={classes.quitPopoverButton} onClick={this.handleTourQuit}>
            Skip Tour
          </div>
          <div className={classes.nextPopoverButton}>
            Got it
          </div>
        </div>
      </div>
    )
  }

  render () {
    const {
      classes,
      theme,
      tooltip,
      tourStep,
      tourTooltip,
      onClick,
      icon,
      children,
      onContextMenu,
      ContextMenuComponent,
      ...passProps
    } = this.props
    const {
      hasSeenTour,
      currentTourStep,
      dismissingTour,
      contextMenuAnchor,
      tooltipOpen
    } = this.state

    const showTourPopover = !hasSeenTour && tourStep && currentTourStep === tourStep && !dismissingTour
    return (
      <div {...passProps}>
        <PrimaryTooltip
          placement='right'
          {...(showTourPopover ? {
            key: 'tour', // Set the key to force a re-render when switching between tour and non-tour
            title: this.renderTourTooltipContent(classes, tourTooltip),
            width: 'none',
            themeName: 'tour',
            open: true,
            interactive: true,
            classes: { popper: classes.popoverPopper } // Generates a warning but gets passed through
          } : {
            key: 'normal', // Set the key to force a re-render when switching between tour and non-tour
            title: tooltip,
            open: tooltipOpen,
            onClose: this.handleCloseTooltip,
            onOpen: this.handleOpenTooltip
          })}>
          <div
            {...passProps}
            onContextMenu={this.handleOpenContextMenu}
            className={classes.container}>
            <IconButton onClick={this.handleIconClick} className={classes.button}>
              {icon}
            </IconButton>
            {children}
          </div>
        </PrimaryTooltip>
        {ContextMenuComponent ? (
          <Menu
            open={!!contextMenuAnchor}
            anchorEl={contextMenuAnchor}
            MenuListProps={{ dense: true }}
            disableEnforceFocus
            disableAutoFocusItem
            onClose={this.handleHideContextMenu}>
            <ContextMenuComponent onRequestClose={this.handleHideContextMenu} />
          </Menu>
        ) : undefined}
      </div>
    )
  }
}

export default SidelistControl
