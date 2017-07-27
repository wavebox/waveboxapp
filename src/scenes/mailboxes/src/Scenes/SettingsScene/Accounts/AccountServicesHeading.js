import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../CommonSettingStyles'

export default class AccountServicesHeading extends React.Component {
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
    const { ...passProps } = this.props
    delete passProps.mailbox

    return (
      <div {...passProps}>
        <h1 style={styles.heading}>Services</h1>
        <p style={styles.headingInfo}>
          This account is split into seperate services, for example Email,
          Storage &amp; Contacts. You can enable, disable &amp; change the
          way these services behave below
        </p>
      </div>
    )
  }
}
