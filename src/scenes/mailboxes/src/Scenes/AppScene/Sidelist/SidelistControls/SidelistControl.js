import React from 'react'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'
import uuid from 'uuid'
import { settingsActions, settingsStore, Tour } from 'stores/settings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ThemeTools from 'wbui/Themes/ThemeTools'
import DefaultTooltip400w from 'wbui/Tooltips/DefaultTooltip400w'
import TourTooltip from 'wbui/Tooltips/TourTooltip'

const styles = (theme) => ({
  // Icon
  container: {
    textAlign: 'center',
    WebkitAppRegion: 'no-drag'
  },
  button: {
    backgroundColor: 'transparent !important',
    height: 32,
    width: 32
  },

  // Tour content
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
    textAlign: 'center'
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
    opacity: 0.7
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
    tourStep: PropTypes.oneOf(Object.keys(Tour.TOUR_STEPS)).isRequired,
    tourTooltip: PropTypes.node.isRequired,
    tourTooltipStyles: PropTypes.shape({
      style: PropTypes.object.isRequired,
      arrowStyle: PropTypes.object.isRequired
    })
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
      generatedId: uuid.v4(),
      hovering: false,
      hasSeenTour: settingsState.hasSeenTour,
      currentTourStep: settingsState.tourStep,
      dismissingTour: false
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
      tourTooltipStyles,
      onClick,
      className,
      icon,
      ...passProps
    } = this.props
    const {
      generatedId,
      hovering,
      hasSeenTour,
      currentTourStep,
      dismissingTour
    } = this.state

    const showTourPopover = !hasSeenTour && currentTourStep === tourStep && !dismissingTour
    return (
      <div
        {...passProps}
        className={classNames(classes.container, className)}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        id={`ReactComponent-Sidelist-Control-${generatedId}`}>
        <IconButton
          onClick={(...args) => {
            this.setState({ hovering: false })
            if (onClick) { onClick(...args) }
          }}
          className={classes.button}>
          {icon}
        </IconButton>
        <DefaultTooltip400w
          active={hovering && !showTourPopover}
          tooltipTimeout={0}
          position='right'
          arrow='center'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Control-${generatedId}`}>
          {tooltip}
        </DefaultTooltip400w>
        {showTourPopover ? (
          <TourTooltip
            active
            tooltipTimeout={0}
            popoverStyle={tourTooltipStyles ? tourTooltipStyles.style : undefined}
            popoverArrowStyle={tourTooltipStyles ? tourTooltipStyles.arrowStyle : undefined}
            position='right'
            arrow='center'
            group={generatedId}
            parent={`#ReactComponent-Sidelist-Control-${generatedId}`}>
            {this.renderTourTooltipContent(classes, tourTooltip)}
          </TourTooltip>
        ) : undefined}
      </div>
    )
  }
}

export default SidelistControl
