import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import classNames from 'classnames'
import { Button } from '@material-ui/core'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'

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
  },
  headingAction: {
    textAlign: 'center'
  },
  buttonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class AccountServicesHeading extends React.Component {
  /* **************************************************************************/
  // class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, classes, className, ...passProps } = this.props

    return (
      <div className={classNames(className, classes.root)} {...passProps}>
        <h2 className={classes.heading}>Services</h2>
        <p className={classes.headingInfo}>
          Your account is split into seperate services each with their own
          tab and set of behaviours. You can enable, disable &amp; change the
          way these services behave below
        </p>
        <p className={classes.headingAction}>
          <Button
            color='primary'
            variant='raised'
            size='large'
            onClick={() => {
              window.location.hash = `/mailbox_wizard/add/${mailboxId}`
            }}>
            <LibraryAddIcon className={classes.buttonIcon} />
            Add another Service
          </Button>
        </p>
      </div>
    )
  }
}

export default AccountServicesHeading
