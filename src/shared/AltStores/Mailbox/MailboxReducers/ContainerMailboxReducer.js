import MailboxReducer from './MailboxReducer'

class ContainerMailboxReducer extends MailboxReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ContainerMailboxReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the display name for this account
  * @param mailbox: the mailbox to update
  * @param displayName: the display name
  */
  static setDisplayName (mailbox, displayName) {
    return mailbox.changeData({ displayName: displayName })
  }

  /* **************************************************************************/
  // Config
  /* **************************************************************************/

  /**
  * Sets whether to use a custom user agent string or not
  * @param mailbox: the mailbox to update
  * @param use: true to use, false to not
  */
  static setUseCustomUserAgent (mailbox, use) {
    return mailbox.changeData({ useCustomUserAgent: use })
  }

  /**
  * Sets whether to use a custom user agent string or not
  * @param mailbox: the mailbox to update
  * @param str: the user agent string
  */
  static setCustomUserAgentString (mailbox, str) {
    return mailbox.changeData({ customUserAgentString: str })
  }

  /**
  * Restores the user agent config to the default
  * @param mailbox: the mailbox to update
  */
  static restoreUserAgentDefaults (mailbox) {
    return mailbox.changeData({
      customUserAgentString: null,
      useCustomUserAgent: null
    })
  }

  /* **************************************************************************/
  // Window opening
  /* **************************************************************************/

  /**
  * Sets the user config for a window open setting
  * @param mailbox: the mailbox to update
  * @param id: the id of the config setting
  * @param value: the new value
  */
  static setWindowOpenUserConfig (mailbox, id, value) {
    return mailbox.changeData({
      windowOpenUserConfig: {
        ...mailbox.windowOpenUserConfig,
        [id]: value
      }
    })
  }
}

export default ContainerMailboxReducer
