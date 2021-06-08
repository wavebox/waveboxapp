import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    maxWidth: 500,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 12,
    marginBottom: 12
  }
}

@withStyles(styles)
class SettingsListContainer extends React.Component {
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
        {children}
      </div>
    )
  }
}

export default SettingsListContainer
