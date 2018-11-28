import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItemSecondaryAction, IconButton } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  root: {

  },
  iconButton: {
    color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.color', 'default')
  },
  iconButtonLabel: {
    '&>*': {
      fontSize: '20px'
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
      onClick,
      ...passProps
    } = this.props

    return (
      <ListItemSecondaryAction
        className={classNames(className, classes.root)}
        {...passProps}>
        <IconButton
          classes={{ label: classes.iconButtonLabel }}
          className={classes.iconButton}
          onClick={onClick}>
          {children}
        </IconButton>
      </ListItemSecondaryAction>
    )
  }
}

export default TooltipSectionListItemSecondaryAction
