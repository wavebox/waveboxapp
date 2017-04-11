const electron = window.nativeRequire('electron')
const { ipcRenderer, remote } = electron
const { Tray, Menu, nativeImage } = remote
const React = require('react')
const { composeActions } = require('stores/compose')
const { mailboxStore, mailboxActions, mailboxDispatch } = require('stores/mailbox')
const { BLANK_PNG } = require('shared/b64Assets')
const TrayRenderer = require('./TrayRenderer')
const uuid = require('uuid')
const {
  TraySettings: { MOUSE_TRIGGERS, MOUSE_TRIGGER_ACTIONS }
} = require('shared/Models/Settings')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'Tray',
  propTypes: { // Pretty strict on updating. If you're changing these, change shouldComponentUpdate :)
    unreadCount: React.PropTypes.number.isRequired,
    traySettings: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    const { traySettings } = this.props
    this.appTray = new Tray(nativeImage.createFromDataURL(BLANK_PNG))
    if (process.platform === 'win32') {
      this.appTray.on('double-click', () => {
        if (traySettings.mouseTrigger === MOUSE_TRIGGERS.DOUBLE) {
          ipcRenderer.send(traySettings.mouseTriggerAction === MOUSE_TRIGGER_ACTIONS.TOGGLE ? 'toggle-mailbox-visibility-from-tray' : 'show-mailbox-from-tray')
        }
      })
      this.appTray.on('click', () => {
        if (traySettings.mouseTrigger === MOUSE_TRIGGERS.SINGLE) {
          ipcRenderer.send(traySettings.mouseTriggerAction === MOUSE_TRIGGER_ACTIONS.TOGGLE ? 'toggle-mailbox-visibility-from-tray' : 'show-mailbox-from-tray')
        }
      })
    } else if (process.platform === 'linux') {
      // On platforms that have app indicator support - i.e. ubuntu clicking on the
      // icon will launch the context menu. On other linux platforms the context
      // menu is opened on right click. For app indicator platforms click event
      // is ignored
      this.appTray.on('click', () => {
        ipcRenderer.send('toggle-mailbox-visibility-from-tray')
      })
    }
  },

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)

    if (this.appTray) {
      this.appTray.destroy()
      this.appTray = null
    }
  },

  /* **************************************************************************/
  // Data Lifecyle
  /* **************************************************************************/

  getInitialState () {
    return Object.assign({}, this.generateMenuUnreadMessages())
  },

  mailboxesChanged (mailboxState) {
    this.setState(this.generateMenuUnreadMessages(mailboxState))
  },

  /**
  * Generates the unread messages from the mailboxes store
  * @param mailboxState=autogen: the mailbox store
  * @return { mailboxOverviews, mailboxOverviewsSig } with menuUnreadMessages
  * being an array of mailboxes with menu items prepped to display and menuUnreadMessagesSig
  * being a string hash of these to compare
  */
  generateMenuUnreadMessages (mailboxState = mailboxStore.getState()) {
    const mailboxMenuItems = mailboxState.allMailboxes().map((mailbox) => {
      const trayMessages = mailbox.trayMessages
      const messageItemsSignature = trayMessages.map((message) => message.id).join(':')
      let messageItems = trayMessages.map((message) => {
        return {
          id: message.id,
          label: message.text,
          click: (e) => {
            ipcRenderer.send('focus-app', { })
            mailboxActions.changeActive(message.data.mailboxId, message.data.serviceType)
            mailboxDispatch.openItem(message.data.mailboxId, message.data.serviceType, message.data)
          }
        }
      })

      messageItems.unshift(
        {
          label: 'Open Account',
          click: (e) => {
            ipcRenderer.send('focus-app', { })
            mailboxActions.changeActive(mailbox.__id__)
          }
        },

        { type: 'separator' }
      )

      return {
        signature: messageItemsSignature,
        label: [
          mailbox.unreadCount && mailbox.showUnreadBadge ? `(${mailbox.unreadCount})` : undefined,
          mailbox.displayName || 'Untitled'
        ].filter((item) => !!item).join(' '),
        submenu: messageItems.length === 2 ? [...messageItems,
          { label: 'No messages', enabled: false }
        ] : messageItems
      }
    })

    return {
      mailboxOverviews: mailboxMenuItems,
      mailboxOverviewsSig: mailboxMenuItems.map((m) => m.signature).join('|')
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Be really careful here. The tray icon on linux flickers if you update it too
  * freqently
  */
  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.unreadCount !== nextProps.unreadCount) { return true }

    const trayDiff = [
      'unreadColor',
      'unreadBackgroundColor',
      'readColor',
      'readBackgroundColor',
      'showUnreadCount',
      'dpiMultiplier'
    ].findIndex((k) => {
      return this.props.traySettings[k] !== nextProps.traySettings[k]
    }) !== -1
    if (trayDiff) { return true }
    if (this.state.mailboxOverviewsSig !== nextState.mailboxOverviewsSig) { return true }

    return false
  },

  /**
  * @return the tooltip string for the tray icon
  */
  renderTooltip () {
    return this.props.unreadCount ? this.props.unreadCount + ' unread mail' : 'No unread mail'
  },

  /**
  * @return the context menu for the tray icon
  */
  renderContextMenu () {
    const { mailboxOverviews } = this.state
    let mailboxOverviewSection
    if (mailboxOverviews.length === 1) {
      mailboxOverviewSection = [].concat(
        mailboxOverviews[0].submenu,
        { type: 'separator' }
      )
    } else if (mailboxOverviews.length > 1) {
      mailboxOverviewSection = [].concat(
        { label: this.renderTooltip(), enabled: false },
        mailboxOverviews,
        { type: 'separator' }
      )
    }

    const template = [].concat(
      [
        {
          label: 'Compose New Message',
          click: (e) => {
            ipcRenderer.send('focus-app')
            composeActions.composeNewMessage()
          }
        },
        {
          label: 'Show / Hide',
          click: (e) => {
            ipcRenderer.send('toggle-mailbox-visibility-from-tray')
          }
        },
        { type: 'separator' }
      ],
      mailboxOverviewSection,
      [
        {
          label: 'Quit',
          click: (e) => {
            ipcRenderer.send('quit-app')
          }
        }
      ]
    ).filter((item) => !!item)

    return Menu.buildFromTemplate(template)
  },

  /**
  * @return the tray icon size
  */
  trayIconSize () {
    switch (process.platform) {
      case 'darwin': return 22
      case 'win32': return 16
      case 'linux': return 32
      default: return 32
    }
  },

  render () {
    const { unreadCount, traySettings } = this.props

    // Making subsequent calls to the promise can cause the return order to change
    // Guard against this using the renderId
    const renderId = uuid.v4()
    this.renderId = renderId

    TrayRenderer.renderNativeImage(this.trayIconSize(), traySettings, unreadCount)
      .then((image) => {
        if (this.renderId !== renderId) { return } // Someone got in before us
        this.appTray.setImage(image)
        this.appTray.setToolTip(this.renderTooltip())
        this.appTray.setContextMenu(this.renderContextMenu())
      })

    return (<div />)
  }
})
