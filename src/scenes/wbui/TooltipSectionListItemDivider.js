import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { Divider } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  root: {
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.popover.section.dividerColor')
  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionListItemDivider extends React.Component {
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
      ...passProps
    } = this.props

    return (
      <Divider className={classNames(className, classes.root)} {...passProps} />
    )
  }
}

export default TooltipSectionListItemDivider
