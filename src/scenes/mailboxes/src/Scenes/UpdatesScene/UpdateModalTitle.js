import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import { DialogTitle } from 'material-ui'
import classNames from 'classnames'
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt'

const styles = {
  root: {

  },
  icon: {
    verticalAlign: 'top',
    marginRight: 10
  }
}

@withStyles(styles)
class UpdateModalTitle extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    text: PropTypes.string.isRequired,
    IconClass: PropTypes.any.isRequired,
    iconClassName: PropTypes.string,
    titleClassName: PropTypes.string
  }
  static defaultProps = {
    text: 'Wavebox Updates',
    IconClass: SystemUpdateAltIcon
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { text, IconClass, iconClassName, titleClassName, className, classes, ...passProps } = this.props

    return (
      <DialogTitle className={classNames(className, classes.root)} {...passProps}>
        <IconClass className={classNames(iconClassName, classes.icon)} />
        <span className={titleClassName}>{text}</span>
      </DialogTitle>
    )
  }
}

export default UpdateModalTitle
