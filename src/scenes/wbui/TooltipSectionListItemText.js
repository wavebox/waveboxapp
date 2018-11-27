import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItemText } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  text: {
    fontSize: '12px',
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
      ...passProps
    } = this.props

    return (
      <ListItemText
        primaryTypographyProps={{
          ...primaryTypographyProps,
          className: classNames(
            classes.text,
            primaryTypographyProps ? primaryTypographyProps.className : undefined
          )
        }}
        {...passProps} />
    )
  }
}

export default TooltipSectionListItemText
