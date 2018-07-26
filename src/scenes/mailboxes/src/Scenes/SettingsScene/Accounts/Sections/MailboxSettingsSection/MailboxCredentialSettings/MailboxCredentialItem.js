import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import DeleteIcon from '@material-ui/icons/Delete'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import grey from '@material-ui/core/colors/grey'
import InboxIcon from '@material-ui/icons/Inbox'
import SettingsListItem from 'wbui/SettingsListItem'
import ConfirmButton from 'wbui/ConfirmButton'
import GoogleAuth from 'shared/Models/ACAccounts/Google/GoogleAuth'
import MicrosoftAuth from 'shared/Models/ACAccounts/Microsoft/MicrosoftAuth'
import SlackAuth from 'shared/Models/ACAccounts/Slack/SlackAuth'
import TrelloAuth from 'shared/Models/ACAccounts/Trello/TrelloAuth'
import FABGoogleIcon from 'wbfa/FABGoogle'
import FABMicrosoftIcon from 'wbfa/FABMicrosoft'
import FABSlackIcon from 'wbfa/FABSlack'
import FABTrelloIcon from 'wbfa/FABTrello'
import { ListItemText, ListItemSecondaryAction, Select, MenuItem } from '@material-ui/core'
import MicrosoftAuthReducer from 'shared/AltStores/Account/AuthReducers/MicrosoftAuthReducer'
import classNames from 'classnames'

const styles = {
  /**
  * Layout
  */
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  rootLine1: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  rootLine2: {
    width: '100%'
  },

  /**
  * Button
  */
  deleteButton: {
    color: red[600]
  },
  buttonIcon: {
    width: 18,
    height: 18,
    verticalAlign: 'middle',
    marginRight: 6
  },

  /**
  * Heading
  */
  typeIcon: {
    marginRight: 6
  },

  /**
  * Selects
  */
  selectRoot: {
    fontSize: '0.8rem',
    marginTop: 20
  },
  selectControl: {
    '&:focus': {
      backgroundColor: 'transparent'
    }
  },

  /**
  * Sandbox tag
  */
  sandboxedTag: {
    color: grey[600]
  },
  sandboxedTagIcon: {
    fontSize: '16px',
    marginLeft: 16,
    marginRight: 3,
    verticalAlign: 'text-top'
  }
}

@withStyles(styles)
export default class MailboxCredentialItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    authId: PropTypes.string.isRequired,
    divider: PropTypes.bool.isRequired
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

  componentWillReceiveProps (nextProps) {
    if (this.props.authId !== nextProps.authId) {
      this.setState(
        this.extractStateForMailbox(nextProps.authId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForMailbox(this.props.authId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.authId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param authId: the id of the auth
  * @param accountState: the account state
  */
  extractStateForMailbox (authId, accountState) {
    return {
      auth: accountState.getMailboxAuth(authId)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the list item text
  * @param classes: the classes to use
  * @param auth: the auth object
  * @return jsx
  */
  renderListItemText (classes, auth) {
    let TypeIcon
    if (auth.namespace === GoogleAuth.namespace) {
      TypeIcon = FABGoogleIcon
    } else if (auth.namespace === MicrosoftAuth.namespace) {
      TypeIcon = FABMicrosoftIcon
    } else if (auth.namespace === SlackAuth.namespace) {
      TypeIcon = FABSlackIcon
    } else if (auth.namespace === TrelloAuth.namespace) {
      TypeIcon = FABTrelloIcon
    }

    return (
      <ListItemText
        primary={(
          <span>
            {TypeIcon ? <TypeIcon className={classes.typeIcon} /> : undefined}
            <strong>{auth.humanizedNamespace}</strong> {`(${auth.namespace})`}
            {auth.isForSandboxedPartitionId ? (
              <span className={classes.sandboxedTag}>
                <InboxIcon className={classes.sandboxedTagIcon} />Sandboxed
              </span>
            ) : undefined}
          </span>
        )}
        secondary={auth.hasHumanizedIdentifier
          ? auth.humanizedIdentifier
          : auth.namespace
        } />
    )
  }

  /**
  * Renders the delete button
  * @param classes: the classes to use
  * @param authId: the id of the auth to use
  * @return jsx
  */
  renderDeleteButton (classes, authId) {
    return (
      <ListItemSecondaryAction>
        <ConfirmButton
          size='small'
          variant='outlined'
          className={classes.deleteButton}
          content={(
            <span>
              <DeleteIcon className={classes.buttonIcon} />
              Remove
            </span>
          )}
          confirmContent={(
            <span>
              <HelpOutlineIcon className={classes.buttonIcon} />
              Click again to confirm
            </span>
          )}
          confirmWaitMs={4000}
          onConfirmedClick={() => accountActions.removeAuth(authId)} />
      </ListItemSecondaryAction>
    )
  }

  /**
  * Renders any specific options for the auth
  * @param classes: the classes to use
  * @param authId: the id of the auth
  * @param auth: the auth to use
  * @return jsx or undefined
  */
  renderSpecificOptions (classes, authId, auth) {
    if (auth.namespace === MicrosoftAuth.namespace) {
      return (
        <Select
          MenuProps={{
            disableEnforceFocus: true,
            MenuListProps: { dense: true }
          }}
          classes={{ select: classes.selectControl }}
          margin='dense'
          className={classes.selectRoot}
          value={`${auth.isPersonalAccount}`}
          renderValue={(value) => value === 'true'
            ? 'Personal Account (Outlook)'
            : 'Corporate Account (Office365)'
          }
          onChange={(evt) => {
            accountActions.reduceAuth(
              authId,
              MicrosoftAuthReducer.setIsPersonal,
              evt.target.value === 'true'
            )
          }}>
          <MenuItem value='true'>Personal Account (Outlook)</MenuItem>
          <MenuItem value='false'>Corporate Account (Office365)</MenuItem>
        </Select>
      )
    } else {
      return undefined
    }
  }

  render () {
    const {
      authId,
      divider,
      showRestart,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      auth
    } = this.state

    if (!auth) { return false }

    return (
      <SettingsListItem
        divider={divider}
        className={classNames(className, classes.root)}
        {...passProps}>
        <div className={classes.rootLine1}>
          {this.renderListItemText(classes, auth)}
          {this.renderDeleteButton(classes, authId)}
        </div>
        <div className={classes.rootLine2}>
          {this.renderSpecificOptions(classes, authId, auth)}
        </div>
      </SettingsListItem>
    )
  }
}
