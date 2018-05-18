import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'

const styles = {
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
class AccountHeading extends React.Component {
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
    const { mailbox, classes, ...passProps } = this.props

    return (
      <div {...passProps}>
        <h1 className={classes.heading}>Account</h1>
        <p className={classes.headingInfo}>
          <strong>{mailbox.humanizedType}</strong> {mailbox.displayName}
        </p>
      </div>
    )
  }
}

export default AccountHeading
