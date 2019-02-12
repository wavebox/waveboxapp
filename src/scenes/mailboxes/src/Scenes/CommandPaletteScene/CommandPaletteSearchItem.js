import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { ListItem, ListItemText } from '@material-ui/core'
import classNames from 'classnames'

const styles = {
  root: {
    paddingTop: 4,
    paddingBottom: 4,
    height: 65,
    '&:hover:not(:focus)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  avatarContainer: {
    position: 'relative',
    width: 36,
    minWidth: 36,
    height: 36,
    minHeight: 36,
    marginRight: 4
  }
}

@withStyles(styles)
class CommandPaletteSearchItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    avatar: PropTypes.node,
    primaryText: PropTypes.node,
    secondaryText: PropTypes.node
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
      primaryText,
      secondaryText,
      avatar,
      className,
      ...passProps
    } = this.props

    return (
      <ListItem button className={classNames(className, classes.root)} {...passProps}>
        <div className={classes.avatarContainer}>
          {avatar}
        </div>
        <ListItemText
          primary={primaryText || (<span>&nbsp;</span>)}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText || (<span>&nbsp;</span>)}
          secondaryTypographyProps={{ noWrap: true }} />
      </ListItem>
    )
  }
}

export default CommandPaletteSearchItem
