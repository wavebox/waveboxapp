import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import classNames from 'classnames'
import { List } from '@material-ui/core'

const styles = (theme) => ({
  root: {
    overflowY: 'auto',
    paddingTop: 0,

    '&::-webkit-scrollbar': {
      WebkitAppearance: 'none',
      width: 7,
      height: 7
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 4,
      backgroundColor: ThemeTools.getValue(theme, 'wavebox.popover.section.scrollThumb.backgroundColor'),
      boxShadow: ThemeTools.getValue(theme, 'wavebox.popover.section.scrollThumb.boxShadow')
    }
  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionList extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      classes,
      theme,
      className,
      children,
      ...passProps
    } = this.props

    return (
      <List dense className={classNames(classes.root, className)} {...passProps}>
        {children}
      </List>
    )
  }
}

export default TooltipSectionList
