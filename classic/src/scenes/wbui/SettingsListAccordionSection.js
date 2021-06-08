import React from 'react'
import { List } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    width: '100%'
  }
}

@withStyles(styles)
class SettingsListAccordionSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, children, ...passProps } = this.props

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        <List dense>
          {children}
        </List>
      </div>
    )
  }
}

export default SettingsListAccordionSection
