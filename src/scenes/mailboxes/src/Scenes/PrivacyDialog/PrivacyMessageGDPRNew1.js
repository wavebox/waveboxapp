import React from 'react'
import { Dialog, DialogContent, Button, Checkbox, FormControlLabel } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import Resolver from 'Runtime/Resolver'
import PropTypes from 'prop-types'
import { PRIVACY_URL, TERMS_URL, EULA_URL } from 'shared/constants'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import red from '@material-ui/core/colors/red'
import FARSpinnerThirdIcon from 'wbfa/FARSpinnerThird'

const styles = {
  modal: {
    zIndex: 10000
  },
  dialog: {

  },
  dialogContent: {
    width: '100%',
    padding: '0 !important',
    display: 'flex',
    flexDirection: 'column'
  },
  modalBanner: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center bottom',
    backgroundImage: `url("${Resolver.image('privacy.png')}")`,
    backgroundColor: lightBlue[600],
    width: '100%',
    height: 300
  },
  modalContent: {
    padding: 24,
    textAlign: 'center'
  },
  title: {
    marginTop: 0,
    color: lightBlue[600]
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
  checkboxControl: {
    color: lightBlue[600]
  },
  checkboxError: {
    color: red[600],
    fontSize: '85%',
    marginTop: -10
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

@withStyles(styles)
class PrivacyMessageGDPRNew1 extends React.Component {
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
      classes,
      ...passProps
    } = this.props
    const { agreeChecked, agreeCheckboxPrompt } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        className={classes.modal}
        classes={{ paper: classes.dialog }}
        disableBackdropClick
        disableEscapeKeyDown
        {...passProps}>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.modalBanner} />
          <div className={classes.modalContent}>
            <h2 className={classes.title}>Welcome to Wavebox</h2>
            <p className={classes.subtitle}>Your cloud apps will love Wavebox and we hope you will too!</p>
            <p>
              To use Wavebox please review our&nbsp;
              <span className={classes.inlineLink} onClick={this.handleOpenServiceTerms}>Service Agreement</span>
              ,&nbsp;
              <span className={classes.inlineLink} onClick={this.handleOpenEULA}>EULA</span>
              &nbsp;and&nbsp;
              <span className={classes.inlineLink} onClick={this.handleOpenPrivacy}>Privacy Policy</span>
              &nbsp;which together covers our agreement with you and details how we take care of your security
              and privacy. You can change your privacy settings at any time in the app.
            </p>
            <div className={classes.checkboxContainer}>
              <FormControlLabel
                label='I agree to the Service Agreement, EULA and Privacy Policy'
                classes={{ label: classes.checkboxControl }}
                control={(
                  <Checkbox
                    color='primary'
                    disabled={agreeRequestActive}
                    checked={agreeChecked}
                    onChange={this.handleAgreeCheckboxChange} />
                )} />
              {agreeCheckboxPrompt ? (
                <div className={classes.checkboxError}>Please agree before continuing</div>
              ) : undefined}
            </div>
            <div className={classes.primaryButtonContainer}>
              <Button
                variant='raised'
                color='primary'
                className={classes.primaryButton}
                disabled={agreeRequestActive}
                onClick={this.handleAgree}>
                {agreeRequestActive ? (
                  <FARSpinnerThirdIcon spin className={classes.workingIcon} />
                ) : (
                  'Continue'
                )}
              </Button>
              <Button
                className={classes.primaryButton}
                disabled={agreeRequestActive}
                onClick={onDisagree}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default PrivacyMessageGDPRNew1
