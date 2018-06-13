import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { mailboxStore } from 'stores/mailbox'
import { userStore, userActions } from 'stores/user'
import pluralize from 'pluralize'
import grey from '@material-ui/core/colors/grey'
import red from '@material-ui/core/colors/red'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasCloudDownload from '@fortawesome/fontawesome-pro-solid/faCloudDownload'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import StyleMixins from 'wbui/Styles/StyleMixins'

const HUMANIZED_PLATFORMS = {
  'darwin': 'macOS',
  'win32': 'Windows',
  'linux': 'Linux'
}

const styles = {
  // Dialog Title
  dialogTitleIcon: {
    marginRight: 8
  },
  dialogSubtitle: {
    display: 'block',
    fontSize: '65%',
    color: grey[600],
    fontWeight: 300
  },
  replaceAccountsWarning: {
    display: 'block',
    marginTop: 6,
    fontSize: '65%',
    color: red[600]
  },
  replaceAccountsWarningIcon: {
    marginRight: 6,
    width: 18,
    height: 18,
    verticalAlign: 'text-top'
  },

  // Dialog Content
  dialogContent: {
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },

  // Profiles
  profileListItemText: {
    paddingRight: 108
  },
  profileListItemThisMachine: {
    color: grey[400]
  },

  // No profiles
  noProfilesHeading: {
    marginTop: 0
  }
}

@withStyles(styles)
class ProfileRestoreScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesUpdated)
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesUpdated)
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      open: true,
      currentMailboxCount: mailboxStore.getState().mailboxCount(),
      profiles: this.sanitizeProfiles(userState.userProfilesFetch.data),
      userIsLoggedIn: userState.user.isLoggedIn,
      userEmail: userState.user.userEmail,
      userEnableProfileSync: userState.user.enableProfileSync,
      clientId: userState.clientId
    }
  })()

  mailboxesUpdated = (mailboxState) => {
    this.setState({
      currentMailboxCount: mailboxState.mailboxCount()
    })
  }

  userUpdated = (userState) => {
    this.setState({
      profiles: this.sanitizeProfiles(userState.userProfilesFetch.data),
      userIsLoggedIn: userState.user.isLoggedIn,
      userEmail: userState.user.userEmail,
      userEnableProfileSync: userState.user.enableProfileSync,
      clientId: userState.clientId
    })
  }

  /**
  * Sanitizes the profiles for our use
  * @param raw: the raw profiles
  * @return the sanitized versions
  */
  sanitizeProfiles (raw) {
    return (raw || []).sort((a, b) => b.timestamp - a.timestamp)
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  handleRestoreProfile = (profileId) => {
    userActions.restoreUserProfile(profileId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders a profile
  * @param classes: the classes to use to render
  * @param profile: the profile to render
  * @param clientId: the id of the current client
  * @return jsx
  */
  renderProfile (classes, profile, clientId) {
    const mailboxCount = Object.keys(profile.data['mailboxes_db.json'] || {}).length || 0
    const isThisMachine = clientId === profile.id

    return (
      <ListItem key={profile.id}>
        <ListItemText
          className={classes.profileListItemText}
          primary={isThisMachine ? (
            <span className={classes.profileListItemThisMachine}>This machine</span>
          ) : ([
            HUMANIZED_PLATFORMS[profile.machine.platform],
            `(${profile.machine.name || 'Unnamed'})`
          ].join(' '))}
          secondary={(
            <span className={isThisMachine ? classes.profileListItemThisMachine : undefined}>
              {[
                `${mailboxCount} ${pluralize('account', mailboxCount)}`,
                `Last synced ${new Date(profile.timestamp).toLocaleDateString()}`
              ].join('. ')}
            </span>
          )} />
        <ListItemSecondaryAction>
          <Button
            variant='outlined'
            color='primary'
            disabled={isThisMachine}
            onClick={(evt) => this.handleRestoreProfile(profile.id)}>
            Restore
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render () {
    const { classes } = this.props
    const {
      open,
      currentMailboxCount,
      profiles,
      userIsLoggedIn,
      userEmail,
      clientId
    } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogTitle>
          <span>
            <FontAwesomeIcon
              icon={fasCloudDownload}
              className={classes.dialogTitleIcon} />
            Restore Profile
          </span>
          <span className={classes.dialogSubtitle}>
            Restoring a profile from another machine will bring most of your configuration
            to this machine and is a fast way to get up and running
          </span>
          {currentMailboxCount !== 0 ? (
            <span className={classes.replaceAccountsWarning}>
              <ErrorOutlineIcon className={classes.replaceAccountsWarningIcon} />
              {`Restoring from a profile will remove the ${currentMailboxCount} ${pluralize('account', currentMailboxCount)} on this machine`}
            </span>
          ) : undefined}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {profiles.length ? (
            <List>
              {profiles.map((profile) => this.renderProfile(classes, profile, clientId))}
            </List>
          ) : (
            <div>
              <h5 className={classes.noProfilesHeading}>
                {userIsLoggedIn ? (
                  `No profiles found for ${userEmail}`
                ) : (
                  `No profiles found`
                )}
              </h5>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button className={classes.button} onClick={this.handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ProfileRestoreScene
