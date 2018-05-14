import React from 'react'
import { RaisedButton, FlatButton, Dialog, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import * as Colors from 'material-ui/styles/colors'
import Resolver from 'Runtime/Resolver'
import PropTypes from 'prop-types'
import { PRIVACY_URL } from 'shared/constants'

const styles = {
  modal: {
    zIndex: 10000
  },
  modalBody: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  modalBanner: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center bottom',
    backgroundColor: Colors.lightBlue600,
    width: '100%',
    height: 300
  },
  modalContent: {
    padding: 24,
    textAlign: 'center'
  },
  title: {
    marginTop: 0,
    color: Colors.lightBlue600
  },
  primaryButtonContainer: {
    marginTop: 12,
    marginBottom: 12
  },
  primaryButton: {
    width: 140,
    margin: 12
  }
}

export default class PrivacyMessageGDPRExisting1 extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onAgree: PropTypes.func.isRequired,
    onDisagree: PropTypes.func.isRequired,
    agreeRequestActive: PropTypes.bool.isRequired,
    open: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles opening the privacy url
  * @param evt: the event that fired
  */
  handleOpenPrivacy = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal(PRIVACY_URL)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      onAgree,
      onDisagree,
      agreeRequestActive,
      open,
      ...passProps
    } = this.props

    return (
      <Dialog modal style={styles.modal} bodyStyle={styles.modalBody} open={open} {...passProps}>
        <div style={{...styles.modalBanner, backgroundImage: `url("${Resolver.image('privacy.png')}")`}} />
        <div style={styles.modalContent}>
          <h2 style={styles.title}>Your Privacy Settings</h2>
          <p>
            Your privacy and security is very important to us and we want to share our
            updated GDPR compliant Privacy Policy for your consent. You can change your privacy settings
            at any time by going to Settings > Wavebox.
          </p>
          <div style={styles.primaryButtonContainer}>
            <RaisedButton
              style={styles.primaryButton}
              disabled={agreeRequestActive}
              onClick={this.handleOpenPrivacy}
              label='Review Policy' />
            <RaisedButton
              primary
              style={styles.primaryButton}
              disabled={agreeRequestActive}
              onClick={onAgree}
              label={agreeRequestActive ? undefined : 'Agree'}
              icon={agreeRequestActive ? (<FontIcon style={styles.workingIcon} className='far fa-fw fa-spin fa-spinner-third' />) : undefined} />
          </div>
          <div>
            <FlatButton
              disabled={agreeRequestActive}
              onClick={onDisagree}
              label='Cancel' />
          </div>
        </div>
      </Dialog>
    )
  }
}
