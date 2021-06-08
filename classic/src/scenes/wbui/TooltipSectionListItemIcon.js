import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItemIcon } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  root: {
    color: ThemeTools.getStateValue(theme, 'wavebox.popover.section.listItem.button.color', 'default'),
    marginRight: 0,
    width: 30,
    height: 30,
    paddingTop: 5,
    paddingLeft: 5,

    '&>*': {
      fontSize: '20px'
    }
  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionListItemIcon extends React.Component {
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
      <ListItemIcon
        className={classNames(className, classes.root)}
        {...passProps}>
        {children}
      </ListItemIcon>
    )
  }
}

export default TooltipSectionListItemIcon
