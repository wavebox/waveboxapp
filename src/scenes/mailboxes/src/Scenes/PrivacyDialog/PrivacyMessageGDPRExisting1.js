import React from 'react'
import { Dialog, DialogContent, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import Resolver from 'Runtime/Resolver'
import PropTypes from 'prop-types'
import { PRIVACY_URL } from 'shared/constants'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
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
  primaryButtonContainer: {
    marginTop: 12,
    marginBottom: 12
  },
  primaryButton: {
    width: 140,
    margin: 12
  }
}

@withStyles(styles)
class PrivacyMessageGDPRExisting1 extends React.Component {
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
      classes,
      ...passProps
    } = this.props

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
            <h2 className={classes.title}>Your Privacy Settings</h2>
            <p>
              Your privacy and security are very important to us and we want to share our
              updated GDPR compliant Privacy Policy for your consent. You can change your privacy settings
              at any time by going to Settings > Wavebox.
            </p>
            <div className={classes.primaryButtonContainer}>
              <Button
                variant='raised'
                className={classes.primaryButton}
                disabled={agreeRequestActive}
                onClick={this.handleOpenPrivacy}>
                Review Policy
              </Button>
              <Button
                variant='raised'
                color='primary'
                className={classes.primaryButton}
                disabled={agreeRequestActive}
                onClick={onAgree}>
                {agreeRequestActive ? (
                  <FARSpinnerThirdIcon spin className={classes.workingIcon} />
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
            <div>
              <Button disabled={agreeRequestActive} onClick={onDisagree}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default PrivacyMessageGDPRExisting1
