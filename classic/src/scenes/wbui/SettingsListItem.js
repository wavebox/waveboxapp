import React from 'react'
import { ListItem } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {

  }
}

@withStyles(styles)
class SettingsListItem extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, children, ...passProps } = this.props

    return (
      <ListItem dense divider className={classNames(classes.root, className)} {...passProps}>
        {children}
      </ListItem>
    )
  }
}

export default SettingsListItem
