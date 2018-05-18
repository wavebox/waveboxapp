import PropTypes from 'prop-types'
import React from 'react'
import ColorPickerButton from 'wbui/ColorPickerButton'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from '@material-ui/core/styles'
import SmsIcon from '@material-ui/icons/Sms'
import InsertEmoticonButton from '@material-ui/icons/InsertEmoticon'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import ColorLensIcon from '@material-ui/icons/ColorLens'
import { Button, ListItemText } from '@material-ui/core'

const styles = {
  buttonIcon: {
    marginRight: 6
  },
  fileInputButton: {
    marginRight: 15,
    position: 'relative',
    overflow: 'hidden'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: '100%',
    cursor: 'pointer'
  }
}

@withStyles(styles)
class AccountAppearanceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      ui: settingsStore.getState().ui,
      userHasServices: userState.user.hasServices,
      userHasSleepable: userState.user.hasSleepable
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      ui: settingsState.ui
    })
  }
  userChanged = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices,
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleCustomAvatarChange = (evt) => {
    if (!evt.target.files[0]) { return }

    // Load the image
    const reader = new window.FileReader()
    reader.addEventListener('load', () => {
      // Get the image size
      const image = new window.Image()
      image.onload = () => {
        // Scale the image down. Never scale up
        const scale = Math.min(1.0, 150 / (image.width > image.height ? image.width : image.height))
        const width = image.width * scale
        const height = image.height * scale

        // Resize the image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, width, height)

        // Save it to disk
        mailboxActions.setCustomAvatar(this.props.mailbox.id, canvas.toDataURL())
      }
      image.src = reader.result
    }, false)
    reader.readAsDataURL(evt.target.files[0])
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, classes, ...passProps } = this.props
    const { userHasServices, userHasSleepable, ui } = this.state

    const hasCumulativeBadge = userHasServices && ((
      mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR &&
      mailbox.hasAdditionalServices
    ) || (
        mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR &&
        mailbox.collapseSidebarServices &&
        mailbox.hasAdditionalServices
      ))
    const sleepIndicatorText = mailbox.supportsAdditionalServiceTypes ? (
      'Show sleeping service icons in grey'
    ) : (
      'Show sleeping account icon in grey'
    )

    return (
      <div {...passProps}>
        <SettingsListSection title='Appearance'>
          <SettingsListItem>
            <ColorPickerButton
              buttonProps={{ variant: 'raised', size: 'small' }}
              value={mailbox.color}
              onChange={(col) => mailboxActions.reduce(mailbox.id, MailboxReducer.setColor, col)}>
              <ColorLensIcon className={classes.buttonIcon} />
              Account Color
            </ColorPickerButton>
          </SettingsListItem>
          <SettingsListItem>
            <Button
              size='small'
              variant='raised'
              className={classes.fileInputButton}>
              <InsertEmoticonButton className={classes.buttonIcon} />
              Change Account Icon
              <input
                type='file'
                className={classes.fileInput}
                accept='image/*'
                onChange={this.handleCustomAvatarChange} />
            </Button>
            <Button size='small' variant='raised' onClick={() => mailboxActions.setCustomAvatar(mailbox.id, undefined)}>
              <NotInterestedIcon className={classes.buttonIcon} />
              Reset Account Icon
            </Button>
          </SettingsListItem>
          <SettingsListSwitch
            label='Show Account Color around Icon'
            onChange={(evt, toggled) => mailboxActions.reduce(mailbox.id, MailboxReducer.setShowAvatarColorRing, toggled)}
            checked={mailbox.showAvatarColorRing} />
          {userHasSleepable ? (
            <SettingsListSwitch
              disabled={!ui.showSleepableServiceIndicator}
              label={ui.showSleepableServiceIndicator ? (sleepIndicatorText) : (
                <span>
                  <span>{sleepIndicatorText}</span>
                  <br />
                  <small>Enable "Show sleeping account icons in grey" in the main UI settings first</small>
                </span>
              )}
              onChange={(evt, toggled) => {
                mailboxActions.reduce(mailbox.id, MailboxReducer.setShowSleepableServiceIndicator, toggled)
              }}
              checked={mailbox.showSleepableServiceIndicator} />
          ) : undefined}
        </SettingsListSection>
        {hasCumulativeBadge ? (
          <SettingsListSection title='Appearance' subtitle='Sidebar Badge'>
            <SettingsListItem>
              <ListItemText primary={(
                <span>
                  When you have multiple services you can show the total unread count for those
                  services in the sidebar, so at a glance you know what's new
                </span>
              )} />
            </SettingsListItem>
            <SettingsListSwitch
              label='Show total unread count from all services'
              onChange={(evt, toggled) => {
                mailboxActions.reduce(mailbox.id, MailboxReducer.setShowCumulativeSidebarUnreadBadge, toggled)
              }}
              checked={mailbox.showCumulativeSidebarUnreadBadge} />
            <SettingsListItem>
              <ColorPickerButton
                buttonProps={{ variant: 'raised', size: 'small' }}
                value={mailbox.cumulativeSidebarUnreadBadgeColor}
                onChange={(col) => mailboxActions.reduce(mailbox.id, MailboxReducer.setCumulativeSidebarUnreadBadgeColor, col)}>
                <SmsIcon className={classes.buttonIcon} />
                Badge Color
              </ColorPickerButton>
            </SettingsListItem>
          </SettingsListSection>
        ) : undefined}
      </div>
    )
  }
}

export default AccountAppearanceSettings
