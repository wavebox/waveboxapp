import React from 'react'
import { List } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import SettingsListItem from './SettingsListItem'

const styles = {
  root: {
    padding: 0
  },
  listItemInner: {
    width: '100%'
  }
}

@withStyles(styles)
class SettingsListItemSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { title, classes, className, children, ...passProps } = this.props

    return (
      <SettingsListItem {...passProps} className={classNames(className, classes.root)}>
        <List dense className={classes.listItemInner}>
          {children}
        </List>
      </SettingsListItem>
    )
  }
}

export default SettingsListItemSection
