import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import classNames from 'classnames'

const styles = {
  root: {
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  heading: {
    marginTop: 30,
    color: grey[900],
    fontWeight: 'normal',
    marginBottom: 10
  },
  headingInfo: {
    marginTop: -10,
    marginBottom: 10,
    color: grey[700]
  }
}

@withStyles(styles)
class ServicesHeading extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, mailbox, ...passProps } = this.props

    return (
      <div className={classNames(className, classes.root)} {...passProps}>
        <h2 className={classes.heading}>Services</h2>
        <p className={classes.headingInfo}>
          This account is split into seperate services, for example Email,
          Storage &amp; Contacts. You can enable, disable &amp; change the
          way these services behave below
        </p>
      </div>
    )
  }
}

export default ServicesHeading
