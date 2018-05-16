import PropTypes from 'prop-types'
import React from 'react'
import { Paper, RaisedButton, FontIcon, Toggle } from 'material-ui' //TODO
import { ColorPickerButton } from 'Components'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

export default class AccountAppearanceSettings extends React.Component {
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
    const { mailbox, ...passProps } = this.props
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
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Appearance</h1>
        <div style={styles.button}>
          <ColorPickerButton
            label='Account Color'
            icon={<FontIcon className='material-icons'>color_lens</FontIcon>}
            value={mailbox.color}
            onChange={(col) => mailboxActions.reduce(mailbox.id, MailboxReducer.setColor, col)} />
        </div>
        <div style={styles.button}>
          <RaisedButton
            label='Change Account Icon'
            containerElement='label'
            icon={<FontIcon className='material-icons'>insert_emoticon</FontIcon>}
            style={styles.fileInputButton}>
            <input
              type='file'
              accept='image/*'
              onChange={this.handleCustomAvatarChange}
              style={styles.fileInput} />
          </RaisedButton>
        </div>
        <div style={styles.button}>
          <RaisedButton
            icon={<FontIcon className='material-icons'>not_interested</FontIcon>}
            onClick={() => mailboxActions.setCustomAvatar(mailbox.id, undefined)}
            label='Reset Account Icon' />
        </div>
        <Toggle
          toggled={mailbox.showAvatarColorRing}
          label='Show Account Color around Icon'
          labelPosition='right'
          onToggle={(evt, toggled) => mailboxActions.reduce(mailbox.id, MailboxReducer.setShowAvatarColorRing, toggled)} />
        {userHasSleepable ? (
          <Toggle
            disabled={!ui.showSleepableServiceIndicator}
            toggled={mailbox.showSleepableServiceIndicator}
            label={ui.showSleepableServiceIndicator ? (sleepIndicatorText) : (
              <span>
                <span>{sleepIndicatorText}</span>
                <br />
                <small>Enable "Show sleeping account icons in grey" in the main UI settings first</small>
              </span>
            )}
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setShowSleepableServiceIndicator, toggled)
            }} />
        ) : undefined}
        {hasCumulativeBadge ? (
          <div>
            <hr style={styles.subsectionRule} />
            <h1 style={styles.subsectionheading}>Sidebar Badge</h1>
            <p style={styles.subheadingInfo}>
              When you have multiple services you can show the total unread count for those
              services in the sidebar, so at a glance you know what's new
            </p>
            <Toggle
              toggled={mailbox.showCumulativeSidebarUnreadBadge}
              label='Show total unread count from all services'
              labelPosition='right'
              onToggle={(evt, toggled) => {
                mailboxActions.reduce(mailbox.id, MailboxReducer.setShowCumulativeSidebarUnreadBadge, toggled)
              }} />
            <div style={styles.button}>
              <ColorPickerButton
                label='Badge Color'
                icon={<FontIcon className='material-icons'>sms</FontIcon>}
                value={mailbox.cumulativeSidebarUnreadBadgeColor}
                onChange={(col) => {
                  mailboxActions.reduce(mailbox.id, MailboxReducer.setCumulativeSidebarUnreadBadgeColor, col)
                }} />
            </div>
          </div>
        ) : undefined}
      </Paper>
    )
  }
}
