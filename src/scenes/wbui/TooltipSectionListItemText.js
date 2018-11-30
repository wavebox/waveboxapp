import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItemText } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  primaryText: {
    fontSize: '12px',
    color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.color', 'default'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.color', 'hover')
    }
  },
  secondaryText: {
    fontSize: '11px',
    opacity: 0.75,
    color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.color', 'default'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.color', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionListItemText extends React.Component {
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
      primaryTypographyProps,
      secondaryTypographyProps,
      ...passProps
    } = this.props

    return (
      <ListItemText
        primaryTypographyProps={{
          ...primaryTypographyProps,
          className: classNames(
            classes.primaryText,
            primaryTypographyProps ? primaryTypographyProps.className : undefined
          )
        }}
        secondaryTypographyProps={{
          ...secondaryTypographyProps,
          className: classNames(
            classes.secondaryText,
            secondaryTypographyProps ? secondaryTypographyProps.className : undefined
          )
        }}
        {...passProps} />
    )
  }
}

export default TooltipSectionListItemText
