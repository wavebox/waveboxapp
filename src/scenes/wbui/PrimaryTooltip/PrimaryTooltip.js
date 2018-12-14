import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ErrorBoundary from '../ErrorBoundary'

const styles = (theme) => {
  return {
    tooltip: {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: '13px',

      '&.w-200': { maxWidth: 200 },
      '&.w-400': { maxWidth: 400 },
      '&.w-none': { maxWidth: 'none' },
      '&.no-padd': { padding: 0 },

      '&.theme-default': {
        background: `linear-gradient(to right, ${ThemeTools.getValue(theme, 'wavebox.popover.backgroundGradientColors')})`,
        color: ThemeTools.getValue(theme, 'wavebox.popover.color'),
        boxShadow: ThemeTools.getValue(theme, 'wavebox.popover.boxShadow')
      },
      '&.theme-upgrade': {
        background: ThemeTools.getStateValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor'),
        color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.upgrade.popover.color')
      },
      '&.theme-tour': {
        background: ThemeTools.getValue(theme, 'wavebox.tourPopover.backgroundColor'),
        color: ThemeTools.getValue(theme, 'wavebox.tourPopover.color')
      }
    },
    tooltipArrowPopper: {
      opacity: 1,
      '&[x-placement*="bottom"] $tooltipArrowArrow': {
        top: 0,
        left: 0,
        marginTop: '-0.9em',
        width: '3em',
        height: '1em',
        '&::before': {
          borderWidth: '0 1em 1em 1em'
        },
        '&.theme-default::before': {
          borderColor: `transparent transparent ${ThemeTools.getValue(theme, 'wavebox.popover.backgroundColor')} transparent`
        },
        '&.theme-upgrade::before': {
          borderColor: `transparent transparent ${ThemeTools.getValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor')} transparent`
        },
        '&.theme-tour::before': {
          borderColor: `transparent transparent ${ThemeTools.getValue(theme, 'wavebox.tourPopover.backgroundColor')} transparent`
        }
      },
      '&[x-placement*="top"] $tooltipArrowArrow': {
        bottom: 0,
        left: 0,
        marginBottom: '-0.9em',
        width: '3em',
        height: '1em',
        '&::before': {
          borderWidth: '1em 1em 0 1em'
        },
        '&.theme-default::before': {
          borderColor: `${ThemeTools.getValue(theme, 'wavebox.popover.backgroundColor')} transparent transparent transparent`
        },
        '&.theme-upgrade::before': {
          borderColor: `${ThemeTools.getValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor')} transparent transparent transparent`
        },
        '&.theme-tour::before': {
          borderColor: `${ThemeTools.getValue(theme, 'wavebox.tourPopover.backgroundColor')} transparent transparent transparent`
        }
      },
      '&[x-placement*="right"] $tooltipArrowArrow': {
        left: 0,
        marginLeft: '-0.9em',
        height: '3em',
        width: '1em',
        '&::before': {
          borderWidth: '1em 1em 1em 0'
        },
        '&.theme-default::before': {
          borderColor: `transparent ${ThemeTools.getValue(theme, 'wavebox.popover.backgroundColor')} transparent transparent`
        },
        '&.theme-upgrade::before': {
          borderColor: `transparent ${ThemeTools.getValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor')} transparent transparent`
        },
        '&.theme-tour::before': {
          borderColor: `transparent ${ThemeTools.getValue(theme, 'wavebox.tourPopover.backgroundColor')} transparent transparent`
        }
      },
      '&[x-placement*="left"] $tooltipArrowArrow': {
        right: 0,
        marginRight: '-0.9em',
        height: '3em',
        width: '1em',
        '&::before': {
          borderWidth: '1em 0 1em 1em'
        },
        '&.theme-default::before': {
          borderColor: `transparent transparent transparent ${ThemeTools.getValue(theme, 'wavebox.popover.backgroundColor')}`
        },
        '&.theme-upgrade::before': {
          borderColor: `transparent transparent transparent ${ThemeTools.getValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor')}`
        },
        '&.theme-tour::before': {
          borderColor: `transparent transparent transparent ${ThemeTools.getValue(theme, 'wavebox.tourPopover.backgroundColor')}`
        }
      }
    },
    tooltipArrowArrow: {
      position: 'absolute',
      fontSize: 7,
      width: '3em',
      height: '3em',
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid'
      }
    }
  }
}

@withStyles(styles)
class PrimaryTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    title: PropTypes.node,
    children: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
    width: PropTypes.oneOf([200, 400, 'none']).isRequired,
    themeName: PropTypes.oneOf(['default', 'tour', 'upgrade']),
    disablePadding: PropTypes.bool.isRequired,
    guardErrors: PropTypes.bool.isRequired
  }

  static defaultProps = {
    width: 400,
    themeName: 'default',
    disablePadding: false,
    guardErrors: true
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    arrowRef: null
  }

  handleArrowRef = (node) => {
    this.setState({ arrowRef: node })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      classes,
      theme,
      title,
      children,
      disabled,
      disableHoverListener,
      disableTouchListener,
      width,
      themeName,
      disablePadding,
      guardErrors,
      open,
      ...passProps
    } = this.props
    const { arrowRef } = this.state

    return (
      <Tooltip
        title={title ? (
          <React.Fragment>
            {guardErrors ? (
              <ErrorBoundary>{title}</ErrorBoundary>
            ) : (
              title
            )}
            <span
              ref={this.handleArrowRef}
              className={classNames(classes.tooltipArrowArrow, `theme-${themeName}`)} />
          </React.Fragment>
        ) : ''}
        classes={{
          tooltip: classNames(classes.tooltip, `w-${width}`, `theme-${themeName}`, disablePadding ? 'no-padd' : undefined),
          popper: classNames(classes.popper, classes.tooltipArrowPopper)
        }}
        PopperProps={{
          popperOptions: {
            modifiers: {
              arrow: { enabled: !!arrowRef, element: arrowRef }
            }
          }
        }}
        disableFocusListener
        disableHoverListener={disabled ? true : disableHoverListener}
        disableTouchListener={disabled ? true : disableTouchListener}
        open={disabled && typeof (open) === 'boolean' ? false : open}
        {...passProps}>
        {children}
      </Tooltip>
    )
  }
}

export default PrimaryTooltip
