import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import FAIcon from 'wbfa/FAIcon'

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
    icon: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      classes,
      icon,
      className,
      ...passProps
    } = this.props

    return (
      <FAIcon icon={icon} className={classNames(classes.icon, className)} {...passProps} />
    )
  }
}

export default SidelistFAIcon
