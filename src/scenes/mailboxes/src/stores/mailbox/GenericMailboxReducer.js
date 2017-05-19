import MailboxReducer from './MailboxReducer'

class GenericMailboxReducer extends MailboxReducer {
  /* **************************************************************************/
  // Provider Details & counts etc
  /* **************************************************************************/

  /**
  * Sets the display name for this account
  * @param mailbox: the mailbox to update
  * @param displayName: the display name
  */
  static setDisplayName (mailbox, displayName) {
    return mailbox.changeData({ displayName: displayName })
  }

  /**
  * Sets whether to use the page title as the display name or not
  * @param mailbox: the mailbox to update
  * @param use: true to use, false otherwise
  */
  static setUsePageTitleAsDisplayName (mailbox, use) {
    return mailbox.changeData({ usePageTitleAsDisplayName: use })
  }

  /**
  * Sets the page title
  * @param mailbox: the mailbox to update
  * @param title: the page title
  */
  static setPageTitle (mailbox, title) {
    return mailbox.changeData({ pageTitle: title })
  }

  /* **************************************************************************/
  // Display
  /* **************************************************************************/

  /**
  * Sets whether to use the page theme as the color or not
  * @param mailbox: the mailbox to update
  * @param use: true to use, false otherwise
  */
  static setUsePageThemeAsColor (mailbox, use) {
    return mailbox.changeData({ usePageThemeAsColor: use })
  }

  /**
  * Sets the page theme color
  * @param mailbox: the mailbox to update
  * @param color: the page theme color
  */
  static setPageThemeColor (mailbox, color) {
    return mailbox.changeData({
      pageThemeColor: color === '#000000' ? undefined : color // Electron sends black as a no-theme color
    })
  }

  /**
  * Sets the page favicon
  * @param mailbox: the mailbox to update
  * @param favicons: the list of favicons provided by the page
  */
  static setPageFavicon (mailbox, favicons) {
    if (favicons === undefined || favicons.length === 0) {
      return mailbox.changeData({ avatar: undefined })
    } else {
      const validFavicons = favicons
        .map((f) => f.endsWith('/') ? f.substr(0, f.length - 1) : f) // Electron sometimes gives a trailing slash :-/
        .filter((f) => f.endsWith('.png') || f.endsWith('.ico') || f.endsWith('.jpg') || f.endsWith('.gif')) // some websites send junk
      if (validFavicons.length) {
        const bestFavicon = validFavicons.find((f) => f.endsWith('.ico')) || favicons[favicons.length - 1]
        return mailbox.changeData({ avatar: bestFavicon })
      } else {
        return mailbox.changeData({ avatar: undefined })
      }
    }
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
}

export default GenericMailboxReducer
