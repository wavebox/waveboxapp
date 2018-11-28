import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import TooltipSectionListItem from 'wbui/TooltipSectionListItem'
import TooltipSectionListItemText from 'wbui/TooltipSectionListItemText'
import classNames from 'classnames'

const styles = (theme) => ({
  root: {
    paddingTop: 8,
    paddingBottom: 8
  },
  text: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    fontSize: '12px'
  }
})

@withStyles(styles, { withTheme: true })
class ServiceTooltipInfoItem extends React.Component {
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
      children,
      className,
      ...passProps
    } = this.props

    return (
      <TooltipSectionListItem className={classNames(className, classes.root)} {...passProps}>
        <TooltipSectionListItemText
          primaryTypographyProps={{ className: classes.text }}
          primary={children} />
      </TooltipSectionListItem>
    )
  }
}

export default ServiceTooltipInfoItem
