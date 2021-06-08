import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { IconButton } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  iconButton: {
    color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.color', 'default')
  },
  iconButtonLabel: {
    '&>*': {
      fontSize: '20px',
      opacity: 0.8,
      '&:hover': {
        opacity: 1
      }
    }
  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionListItemSecondaryAction extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      className,
      theme,
      children,
      ...passProps
    } = this.props

    return (
      <IconButton
        classes={{ label: classes.iconButtonLabel }}
        className={classNames(className, classes.iconButton)}
        {...passProps}>
        {children}
      </IconButton>
    )
  }
}

export default TooltipSectionListItemSecondaryAction
