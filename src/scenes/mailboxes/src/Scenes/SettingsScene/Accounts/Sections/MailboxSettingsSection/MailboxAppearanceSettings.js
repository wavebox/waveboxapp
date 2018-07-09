import PropTypes from 'prop-types'
import React from 'react'
import ColorPickerButton from 'wbui/ColorPickerButton'
import { accountActions, accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import { withStyles } from '@material-ui/core/styles'
import SmsIcon from '@material-ui/icons/Sms'
import InsertEmoticonButton from '@material-ui/icons/InsertEmoticon'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import ColorLensIcon from '@material-ui/icons/ColorLens'
import { Button } from '@material-ui/core'
import FileUploadButton from 'wbui/FileUploadButton'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import AccountAvatarProcessor from 'shared/AltStores/Account/AccountAvatarProcessor'

const styles = {
  buttonIcon: {
    marginRight: 6,
    width: 18,
    height: 18,
    verticalAlign: 'middle'
  },
  buttonColorPreview: {
    overflow: 'hidden'
  },
  buttonIconColorPreview: {
    marginTop: -9,
    marginRight: 6,
    marginBottom: -9,
    marginLeft: -9,
    padding: 7,
    width: 32,
    height: 34,
    verticalAlign: 'middle'
  },
  buttonSpacer: {
    width: 16,
    height: 1,
    display: 'inline-block'
  }
}

@withStyles(styles)
class MailboxAppearanceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.extractStateForMailbox(nextProps.mailboxId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      uiShowSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator,
      userHasSleepable: userState.user.hasSleepable,
      ...this.extractStateForMailbox(this.props.mailboxId, accountStore.getState())
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      uiShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.mailboxId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param mailboxId: the id of the mailbox
  * @param accountState: the account state
  */
  extractStateForMailbox (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    return mailbox ? {
      mailboxColor: mailbox.color,
      mailboxShowAvatarColorRing: mailbox.showAvatarColorRing,
      mailboxShowSleepableServiceIndicator: mailbox.showSleepableServiceIndicator,
      mailboxShowBadge: mailbox.showBadge,
      mailboxBadgeColor: mailbox.badgeColor,
      mailboxDisplayName: mailbox.displayName
    } : {
      mailboxColor: '#FFF',
      mailboxShowAvatarColorRing: true,
      mailboxShowSleepableServiceIndicator: true,
      mailboxShowBadge: true,
      mailboxBadgeColor: '#FFF'
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, classes, ...passProps } = this.props
    const {
      userHasSleepable,
      uiShowSleepableServiceIndicator,
      mailboxColor,
      mailboxShowAvatarColorRing,
      mailboxShowSleepableServiceIndicator,
      mailboxShowBadge,
      mailboxBadgeColor,
      mailboxDisplayName
    } = this.state

    return (
      <div {...passProps}>
        <SettingsListSection title='Appearance' icon={<ViewQuiltIcon />}>
          <SettingsListItemTextField
            key={`displayName_${mailboxDisplayName}`}
            label='Display Name'
            textFieldProps={{
              defaultValue: mailboxDisplayName,
              placeholder: 'My Account',
              onBlur: (evt) => {
                accountActions.reduceMailbox(mailboxId, MailboxReducer.setDisplayName, evt.target.value)
              }
            }} />
          <SettingsListItem>
            <ColorPickerButton
              buttonProps={{ variant: 'raised', size: 'small', className: classes.buttonColorPreview }}
              value={mailboxColor}
              onChange={(col) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setColor, col)}>
              <ColorLensIcon
                className={classes.buttonIconColorPreview}
                style={ColorPickerButton.generatePreviewIconColors(mailboxColor)} />
              Account Color
            </ColorPickerButton>
            <span className={classes.buttonSpacer} />
            <Button
              variant='raised'
              size='small'
              onClick={() => accountActions.reduceMailbox(mailboxId, MailboxReducer.setColor, undefined)}>
              <NotInterestedIcon className={classes.buttonIcon} />
              Clear Color
            </Button>
          </SettingsListItem>
          <SettingsListItem>
            <ColorPickerButton
              buttonProps={{ variant: 'raised', size: 'small', className: classes.buttonColorPreview }}
              value={mailboxBadgeColor}
              onChange={(col) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setBadgeColor, col)}>
              <SmsIcon
                className={classes.buttonIconColorPreview}
                style={ColorPickerButton.generatePreviewIconColors(mailboxBadgeColor)} />
              Badge Color
            </ColorPickerButton>
          </SettingsListItem>
          <SettingsListItem>
            <FileUploadButton
              size='small'
              variant='raised'
              accept='image/*'
              onChange={(evt) => {
                AccountAvatarProcessor.processAvatarFileUpload(evt, (av) => {
                  accountActions.setCustomAvatarOnMailbox(mailboxId, av)
                })
              }}>
              <InsertEmoticonButton className={classes.buttonIcon} />
              Change Account Icon
            </FileUploadButton>
            <span className={classes.buttonSpacer} />
            <Button
              size='small'
              variant='raised'
              onClick={() => accountActions.setCustomAvatarOnMailbox(mailboxId, undefined)}>
              <NotInterestedIcon className={classes.buttonIcon} />
              Reset Account Icon
            </Button>
          </SettingsListItem>
          <SettingsListItemSwitch
            divider={userHasSleepable}
            label='Show Account Color around Icon'
            onChange={(evt, toggled) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowAvatarColorRing, toggled)}
            checked={mailboxShowAvatarColorRing} />
          {userHasSleepable ? (
            <SettingsListItemSwitch
              disabled={!uiShowSleepableServiceIndicator}
              label={(
                <span>
                  <span>Show sleeping service icons in grey</span>
                  {!uiShowSleepableServiceIndicator ? <br /> : undefined}
                  {!uiShowSleepableServiceIndicator ? (
                    <small>Enable "Show sleeping account icons in grey" in the main UI settings first</small>
                  ) : undefined}
                </span>
              )}
              onChange={(evt, toggled) => {
                accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowSleepableServiceIndicator, toggled)
              }}
              checked={mailboxShowSleepableServiceIndicator} />
          ) : undefined}
          <SettingsListItemSwitch
            divider={false}
            label='Show total unread count from all services'
            onChange={(evt, toggled) => {
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowBadge, toggled)
            }}
            checked={mailboxShowBadge} />
        </SettingsListSection>
      </div>
    )
  }
}

export default MailboxAppearanceSettings
