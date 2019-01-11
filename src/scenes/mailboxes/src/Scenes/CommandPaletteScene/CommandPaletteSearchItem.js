import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { ListItem, ListItemText } from '@material-ui/core'
import classNames from 'classnames'

const styles = {
  root: {
    '&:hover:not(:focus)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  }
}

@withStyles(styles)
class CommandPaletteSearchItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    iconUrl: PropTypes.string,
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
      iconUrl,
      className,
      ...passProps
    } = this.props

    return (
      <ListItem button className={classNames(className, classes.root)} {...passProps}>
        <ListItemText
          primary={primaryText}
          secondary={secondaryText} />
      </ListItem>
    )
  }
}

export default CommandPaletteSearchItem
