import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItem } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 8,
    paddingRight: 8,
    color: ThemeTools.getValue(theme, 'wavebox.popover.section.listItem.color'),
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.popover.section.listItem.backgroundColor')
  },
  rootButton: {
    color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.color', 'default'),
    backgroundColor: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.backgroundColor', 'default'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.color', 'hover'),
      backgroundColor: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.backgroundColor', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionListItem extends React.Component {
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
      button,
      ...passProps
    } = this.props

    return (
      <ListItem
        disableGutters
        className={classNames(classes.root, button ? classes.rootButton : undefined, className)}
        button={button}
        {...passProps}>
        {children}
      </ListItem>
    )
  }
}

export default TooltipSectionListItem
