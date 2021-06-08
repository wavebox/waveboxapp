import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  icon: {
    fontSize: '18px',
    height: '1em',
    width: '1em'
  }
}

@withStyles(styles)
class SidelistFAIcon extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    IconClass: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      classes,
      IconClass,
      className,
      ...passProps
    } = this.props

    return (
      <IconClass className={classNames(classes.icon, className)} {...passProps} />
    )
  }
}

export default SidelistFAIcon
