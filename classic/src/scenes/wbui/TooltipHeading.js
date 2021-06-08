import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from './Themes/ThemeTools'
import classNames from 'classnames'
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp'
import { IconButton } from '@material-ui/core'

const styles = (theme) => ({
  // Titlebar
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${ThemeTools.getValue(theme, 'wavebox.popover.heading.dividerColor')}`,
    color: ThemeTools.getValue(theme, 'wavebox.popover.heading.color'),
    background: `linear-gradient(to bottom, ${ThemeTools.getValue(theme, 'wavebox.popover.heading.backgroundGradientColors')})`,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 12
  },
  titleTextContainer: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 14
  },
  subtitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 12
  },
  controls: {
    marginLeft: 8,
    marginRight: -8
  },
  control: {
    color: ThemeTools.getValue(theme, 'wavebox.popover.heading.button.color'),
    '>*': {
      fontSize: '20px'
    }
  }
})

@withStyles(styles, { withTheme: true })
class TooltipHeading extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    primary: PropTypes.node.isRequired,
    secondary: PropTypes.node,
    actionIcon: PropTypes.node,
    onActionClick: PropTypes.func
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      theme,
      className,
      primary,
      secondary,
      actionIcon,
      onActionClick,
      children,
      ...passProps
    } = this.props

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        <div className={classes.titleTextContainer}>
          <div className={classes.title}>{primary}</div>
          {secondary ? (
            <div className={classes.subtitle}>{secondary}</div>
          ) : undefined}
          {children}
        </div>
        {actionIcon ? (
          <div className={classes.controls}>
            <IconButton onClick={onActionClick} className={classes.control}>
              <SettingsSharpIcon className={classes.titlebarControlIcon} />
            </IconButton>
          </div>
        ) : undefined}
      </div>
    )
  }
}

export default TooltipHeading
