import PropTypes from 'prop-types'
import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, List, ListItem, ListItemText, Grid } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import ServiceAvatar from 'Components/Backed/ServiceAvatar'
import { userActions } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import StyleMixins from 'wbui/Styles/StyleMixins'
import WaveboxSigninButton from 'wbui/SigninButtons/WaveboxSigninButton'
import GoogleSigninButton from 'wbui/SigninButtons/GoogleSigninButton'
import MicrosoftSigninButton from 'wbui/SigninButtons/MicrosoftSigninButton'
import GoogleAuth from 'shared/Models/ACAccounts/Google/GoogleAuth'
import MicrosoftAuth from 'shared/Models/ACAccounts/Microsoft/MicrosoftAuth'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

const styles = {
  // Dialog
  dialog: {
    minWidth: 700,
    maxWidth: 850
  },
  dialogContent: {
    paddingLeft: 0,
    paddingRight: 0,
    marginTop: -10
  },

  // Heading
  dialogHeading: {
    marginBottom: 0
  },
  dialogSubheading: {
    marginTop: 0
  },

  // Grid layout
  gridContainer: {
    position: 'relative'
  },
  gridItem: {
    padding: '0px 36px !important',
    zIndex: 1,
    textAlign: 'center',
    '@media (max-width: 930px)': {
      padding: '0px 12px !important'
    }
  },
  gridVR: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    '&:before': {
      position: 'absolute',
      content: '""',
      top: 0,
      left: 'calc(50% - 2px)',
      width: 2,
      bottom: 0,
      zIndex: 0,
      backgroundColor: '#A6ABA9'
    }
  },
  gridVRText: {
    fontWeight: 'bold',
    color: '#A6ABA9',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 1,
    fontSize: '22px',
    '@media (max-width: 930px)': {
      display: 'none'
    }
  },
  gridSubheading: {
    color: '#A6ABA9',
    marginBottom: 30,
    marginTop: 0,
    fontSize: 15,
    textAlign: 'center'
  },

  // New signin
  newSigninContainer: {
    textAlign: 'center'
  },
  fullWidthButton: {
    margin: '6px 0px',
    width: '100%'
  },

  // Accounts
  accountsList: {
    maxHeight: 300,
    overflowY: 'auto',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  accountAvatar: {
    marginLeft: 3
  },
  noAccounts: {
    textAlign: 'center'
  }
}

@withStyles(styles)
class AccountAuthScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes: {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mode: PropTypes.string
      })
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      auths: this.buildAuthManifest(accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      auths: this.buildAuthManifest(accountState)
    })
  }

  /**
  * Builds the auth manifest
  * @param accountState: the current account state
  * @return the manifest to provide to the state
  */
  buildAuthManifest (accountState) {
    // The whole way this picks out services and auths is pretty poor. Look to refactor this
    // in the future
    const auths = accountState
      .allServicesUnordered()
      .reduce((acc, service) => {
        const mailbox = accountState.getMailbox(service.parentId)
        const auth = accountState.getMailboxAuthForServiceId(service.id)
        if (!mailbox || !auth) { return acc }
        if (auth.namespace !== GoogleAuth.namespace && auth.namespace !== MicrosoftAuth.namespace) { return acc }

        if (acc[auth.id]) {
          acc[auth.id].services.push(service)
        } else {
          acc[auth.id] = {
            auth: auth,
            mailbox: mailbox,
            services: [ service ]
          }
        }

        return acc
      }, {})

    return Object.keys(auths)
      .map((authId) => {
        const rec = auths[authId]
        const likelyService = rec.services.find((service) => {
          if (rec.auth.namespace === GoogleAuth.namespace) {
            return service.type === SERVICE_TYPES.GOOGLE_MAIL || service.type === SERVICE_TYPES.GOOGLE_INBOX
          } else if (rec.auth.namespace === MicrosoftAuth.namespace) {
            return service.type === SERVICE_TYPES.MICROSOFT_MAIL
          } else {
            return false
          }
        })
        return {
          auth: rec.auth,
          mailbox: rec.mailbox,
          service: likelyService || rec.services[0]
        }
      })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, auths } = this.state
    const {
      match: { params: { mode } },
      classes
    } = this.props

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogTitle disableTypography>
          <h3 className={classes.dialogHeading}>Sign in to Wavebox</h3>
          <p className={classes.dialogSubheading}>
            Pick an account to use with Wavebox, this will be used for
            billing and managing your Wavebox settings.
          </p>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Grid container className={classes.gridContainer}>
            <Grid item xs={6} className={classes.gridItem}>
              <p className={classes.gridSubheading}>Sign in with your Account</p>
              <WaveboxSigninButton
                className={classes.fullWidthButton}
                onClick={(evt) => userActions.authenticateWithWavebox({ mode: mode })} />
              <div>
                <Button
                  color='primary'
                  onClick={(evt) => userActions.passwordResetWaveboxAccount({ mode: mode })}>
                  Forgotten password
                </Button>
                <Button
                  color='primary'
                  onClick={(evt) => userActions.createWaveboxAccount({ mode: mode })}>
                  Create an account
                </Button>
              </div>
              <br />
              <GoogleSigninButton
                className={classes.fullWidthButton}
                onClick={(evt) => userActions.authenticateWithGoogle({ mode: mode })} />
              <MicrosoftSigninButton
                className={classes.fullWidthButton}
                onClick={(evt) => userActions.authenticateWithMicrosoft({ mode: mode })} />
            </Grid>
            <div className={classes.gridVR}>
              <div className={classes.gridVRText}>OR</div>
            </div>
            <Grid item xs={6} className={classes.gridItem}>
              <p className={classes.gridSubheading}>Use an account you've added to Wavebox</p>
              <List className={classes.accountsList}>
                {auths.length ? (
                  auths.map(({ auth, mailbox, service }) => {
                    return (
                      <ListItem
                        key={service.id}
                        button
                        disableGutters
                        onClick={(evt) => {
                          userActions.authenticateWithAuth(service.partitionId, auth.namespace, { mode: mode })
                        }}>
                        <ServiceAvatar
                          className={classes.accountAvatar}
                          serviceId={service.id} />
                        <ListItemText
                          primary={service.displayName}
                          secondary={auth.humanizedNamespace} />
                      </ListItem>
                    )
                  })
                ) : (
                  <ListItem disableGutters className={classes.noAccounts}>
                    <ListItemText primary={`No accounts available`} />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default AccountAuthScene
