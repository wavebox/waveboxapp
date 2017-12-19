import PropTypes from 'prop-types'
import React from 'react'
import { composeActions } from 'stores/compose'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
import { BLANK_PNG } from 'shared/b64Assets'
import TrayRenderer from './TrayRenderer'
import uuid from 'uuid'
import MenuTool from 'shared/Electron/MenuTool'
import {
  MOUSE_TRIGGERS,
  MOUSE_TRIGGER_ACTIONS,
  IS_GTK_PLATFORM,
  GTK_UPDATE_MODES
} from 'shared/Models/Settings/TraySettings'
import {
  WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY,
  WB_SHOW_MAILBOX_WINDOW_FROM_TRAY,
  WB_FOCUS_APP,
  WB_QUIT_APP
} from 'shared/ipcEvents'
import electron from 'electron'
import Resolver from 'Runtime/Resolver'

const { ipcRenderer, remote } = electron
const { Menu, nativeImage } = remote

export default class Tray extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    unreadCount: PropTypes.number.isRequired,
    traySettings: PropTypes.object.isRequired,
    launchTraySettings: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    const { launchTraySettings } = this.props
    if (IS_GTK_PLATFORM && launchTraySettings.gtkUpdateMode === GTK_UPDATE_MODES.STATIC) {
      const image = nativeImage.createFromPath(Resolver.icon('app_64.png', Resolver.API_TYPES.NODE))
      const resizedImage = image.resize({ width: launchTraySettings.iconSize, height: launchTraySettings.iconSize })
      this.appTray = new remote.Tray(resizedImage)
    } else {
      this.appTray = new remote.Tray(nativeImage.createFromDataURL(BLANK_PNG))
    }
    this.lastContextMenu = null
    window.addEventListener('beforeunload', this.handleDestroyTray) // Be super pushy about this to avoid dangling tray references

    if (process.platform === 'win32') {
      this.appTray.on('double-click', this.handleMouseTriggerDoubleClick)
      this.appTray.on('click', this.handleMouseTriggerClick)
    } else if (process.platform === 'linux') {
      // On platforms that have app indicator support - i.e. ubuntu clicking on the
      // icon will launch the context menu. On other linux platforms the context
      // menu is opened on right click. For app indicator platforms click event
      // is ignored
      this.appTray.on('click', this.handleToggleVisibility)
    } else if (process.platform === 'darwin') {
      this.appTray.on('right-click', this.handleToggleVisibility)
    }
  }

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    this.handleDestroyTray()
    window.removeEventListener('beforeunload', this.handleDestroyTray)
  }

  /**
  * Destroys the tray icon
  */
  handleDestroyTray = () => {
    if (this.appTray) {
      this.appTray.destroy()
      this.appTray = null
    }
  }

  /* **************************************************************************/
  // Data Lifecyle
  /* **************************************************************************/

  state = (() => {
    return Object.assign({}, this.generateMenuUnreadMessages())
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState(this.generateMenuUnreadMessages(mailboxState))
  }

  /**
  * Generates the unread messages from the mailboxes store
  * @param mailboxState=autogen: the mailbox store
  * @return { mailboxOverviews, mailboxOverviewsSig } with menuUnreadMessages
  * being an array of mailboxes with menu items prepped to display and menuUnreadMessagesSig
  * being a string hash of these to compare
  */
  generateMenuUnreadMessages (mailboxState = mailboxStore.getState()) {
    const mailboxMenuItems = mailboxState.allMailboxes().map((mailbox) => {
      const trayMessages = mailboxState.mailboxTrayMessagesForUser(mailbox.id)
      const messageItemsSignature = trayMessages.map((message) => message.id).join(':')
      let messageItems = trayMessages.map((message) => {
        return {
          id: message.id,
          label: message.text,
          click: (e) => {
            ipcRenderer.send(WB_FOCUS_APP, { })
            mailboxActions.changeActive(message.data.mailboxId, message.data.serviceType)
            mailboxDispatch.openItem(message.data.mailboxId, message.data.serviceType, message.data)
          }
        }
      })

      messageItems.unshift(
        {
          label: 'Open Account',
          click: (e) => {
            ipcRenderer.send(WB_FOCUS_APP, { })
            mailboxActions.changeActive(mailbox.__id__)
          }
        },

        { type: 'separator' }
      )

      const unreadCount = mailboxState.mailboxUnreadCountForUser(mailbox.id)
      return {
        signature: messageItemsSignature,
        label: [
          unreadCount ? `(${unreadCount})` : undefined,
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
  }

  /* **************************************************************************/
  // Action handlers
  /* **************************************************************************/

  /**
  * Handles a mouse trigger click
  */
  handleMouseTriggerClick = () => {
    const { mouseTrigger, mouseTriggerAction } = this.props.traySettings
    if (mouseTrigger === MOUSE_TRIGGERS.SINGLE) {
      switch (mouseTriggerAction) {
        case MOUSE_TRIGGER_ACTIONS.TOGGLE:
          ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY)
          break
        case MOUSE_TRIGGER_ACTIONS.SHOW:
          ipcRenderer.send(WB_SHOW_MAILBOX_WINDOW_FROM_TRAY)
          break
        case MOUSE_TRIGGER_ACTIONS.TOGGLE_MINIMIZE:
          ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY, true)
          break
      }
    }
  }

  /**
  * Handles a mouse trigger double click
  */
  handleMouseTriggerDoubleClick = () => {
    const { mouseTrigger, mouseTriggerAction } = this.props.traySettings
    if (mouseTrigger === MOUSE_TRIGGERS.DOUBLE) {
      switch (mouseTriggerAction) {
        case MOUSE_TRIGGER_ACTIONS.TOGGLE:
          ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY)
          break
        case MOUSE_TRIGGER_ACTIONS.SHOW:
          ipcRenderer.send(WB_SHOW_MAILBOX_WINDOW_FROM_TRAY)
          break
        case MOUSE_TRIGGER_ACTIONS.TOGGLE_MINIMIZE:
          ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY, true)
          break
      }
    }
  }

  /**
  * Toggles the apps visibility
  */
  handleToggleVisibility = () => {
    ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY)
  }

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
      'dpiMultiplier',
      'iconSize'
    ].findIndex((k) => {
      return this.props.traySettings[k] !== nextProps.traySettings[k]
    }) !== -1
    if (trayDiff) { return true }
    if (this.state.mailboxOverviewsSig !== nextState.mailboxOverviewsSig) { return true }

    return false
  }

  /**
  * @return the tooltip string for the tray icon
  */
  renderTooltip () {
    return this.props.unreadCount ? this.props.unreadCount + ' unread items' : 'No unread items'
  }

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
            ipcRenderer.send(WB_FOCUS_APP)
            composeActions.composeNewMessage()
          }
        },
        {
          label: 'Show / Hide',
          click: (e) => {
            ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY)
          }
        },
        { type: 'separator' }
      ],
      mailboxOverviewSection,
      [
        {
          label: 'Quit',
          click: (e) => {
            ipcRenderer.send(WB_QUIT_APP)
          }
        }
      ]
    ).filter((item) => !!item)

    return Menu.buildFromTemplate(template)
  }

  render () {
    const {
      unreadCount,
      traySettings,
      launchTraySettings
    } = this.props

    // Making subsequent calls to the promise can cause the return order to change
    // Guard against this using the renderId
    const renderId = uuid.v4()
    this.renderId = renderId

    TrayRenderer.renderNativeImage(traySettings.iconSize, traySettings, unreadCount)
      .then((image) => {
        if (this.renderId !== renderId) { return } // Someone got in before us

        // Update the icon
        if (IS_GTK_PLATFORM) {
          if (launchTraySettings.gtkUpdateMode === GTK_UPDATE_MODES.RECREATE) {
            this.appTray.destroy()
            this.appTray = new remote.Tray(image)
          } else if (launchTraySettings.gtkUpdateMode === GTK_UPDATE_MODES.UPDATE) {
            this.appTray.setImage(image)
          }
          // We don't update the image on static
        } else {
          this.appTray.setImage(image)
        }
        this.appTray.setToolTip(this.renderTooltip())

        // Prevent Memory leak with menu
        const lastContextMenu = this.lastContextMenu
        this.lastContextMenu = this.renderContextMenu()
        this.appTray.setContextMenu(this.lastContextMenu)
        if (lastContextMenu) {
          MenuTool.fullDestroyMenu(lastContextMenu)
        }
      })

    return (<div />)
  }
}
