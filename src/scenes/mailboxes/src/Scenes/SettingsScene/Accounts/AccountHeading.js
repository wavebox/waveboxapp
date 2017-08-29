import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../CommonSettingStyles'

export default class AccountHeading extends React.Component {
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
    const { mailbox, ...passProps } = this.props

    return (
      <div {...passProps}>
        <h1 style={styles.heading}>Account</h1>
        <p style={styles.headingInfo}>
          <strong>{mailbox.humanizedType}</strong> {mailbox.displayName}
        </p>
      </div>
    )
  }
}
