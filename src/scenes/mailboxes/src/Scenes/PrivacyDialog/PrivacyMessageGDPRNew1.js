import React from 'react'
import { RaisedButton, FlatButton, Checkbox, Dialog, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import * as Colors from 'material-ui/styles/colors'
import Resolver from 'Runtime/Resolver'
import PropTypes from 'prop-types'
import { PRIVACY_URL, TERMS_URL, EULA_URL } from 'shared/constants'

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
  subtitle: {
    fontWeight: 'bold',
    marginTop: 30
  },
  inlineLink: {
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  checkboxContainer: {
    marginTop: 30,
    marginBottom: 30
  },
  checkbox: {
    width: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  checkboxLabel: {
    width: 'auto',
    color: Colors.lightBlue600
  },
  checkboxError: {
    color: Colors.red600
  },
  primaryButtonContainer: {
    marginTop: 12,
    marginBottom: 12
  },
  primaryButton: {
    display: 'block',
    width: 140,
    margin: '12px auto'
  },
  workingIcon: {
    fontSize: 16
  }
}

export default class PrivacyMessageGDPRNew1 extends React.Component {
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
  // Data lifecycle
  /* **************************************************************************/

  state = {
    agreeChecked: false,
    agreeCheckboxPrompt: false
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

  /**
  * Handles opening the terms url
  * @param evt: the event that fired
  */
  handleOpenServiceTerms = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal(TERMS_URL)
  }

  /**
  * Handles opening the eula url
  * @param evt: the event that fired
  */
  handleOpenEULA = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal(EULA_URL)
  }

  /**
  * Handles the agree checkbox changing
  * @param evt: the event that fired
  * @param checked: true if the state is now checked, false otherwise
  */
  handleAgreeCheckboxChange = (evt, checked) => {
    this.setState({
      agreeChecked: checked,
      agreeCheckboxPrompt: false
    })
  }

  /**
  * Handles agreeing
  * @param evt: the event that fired
  */
  handleAgree = (evt) => {
    if (this.state.agreeChecked) {
      this.props.onAgree()
    } else {
      this.setState({ agreeCheckboxPrompt: true })
    }
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
    const { agreeChecked, agreeCheckboxPrompt } = this.state

    return (
      <Dialog modal style={styles.modal} bodyStyle={styles.modalBody} open={open} {...passProps}>
        <div style={{...styles.modalBanner, backgroundImage: `url("${Resolver.image('privacy.png')}")`}} />
        <div style={styles.modalContent}>
          <h2 style={styles.title}>Welcome to Wavebox</h2>
          <p style={styles.subtitle}>Your cloud apps will love Wavebox and we hope you will too!</p>
          <p>
            To use Wavebox, please review our&nbsp;
            <span style={styles.inlineLink} onClick={this.handleOpenServiceTerms}>Service Agreement</span>
            ,&nbsp;
            <span style={styles.inlineLink} onClick={this.handleOpenEULA}>EULA</span>
            &nbsp;and&nbsp;
            <span style={styles.inlineLink} onClick={this.handleOpenPrivacy}>Privacy Policy</span>
            &nbsp;which covers our agreement with you, and details how we take care of your security
            and privacy. You can change your privacy settings at any time in the app.
          </p>
          <div style={styles.checkboxContainer}>
            <Checkbox
              label='I agree to the Service Agreement, EULA and Privacy Policy'
              style={styles.checkbox}
              disabled={agreeRequestActive}
              labelStyle={styles.checkboxLabel}
              checked={agreeChecked}
              onCheck={this.handleAgreeCheckboxChange} />
            {agreeCheckboxPrompt ? (
              <small style={styles.checkboxError}>Please agree before continuing</small>
            ) : undefined}
          </div>
          <div style={styles.primaryButtonContainer}>
            <RaisedButton
              primary
              style={styles.primaryButton}
              disabled={agreeRequestActive}
              onClick={this.handleAgree}
              label={agreeRequestActive ? undefined : 'Continue'}
              icon={agreeRequestActive ? (<FontIcon style={styles.workingIcon} className='far fa-fw fa-spin fa-spinner-third' />) : undefined} />
            <FlatButton
              style={styles.primaryButton}
              disabled={agreeRequestActive}
              onClick={onDisagree}
              label='Cancel' />
          </div>
        </div>
      </Dialog>
    )
  }
}
