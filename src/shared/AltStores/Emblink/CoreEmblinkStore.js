import RemoteStore from '../RemoteStore'
import addressparser from 'addressparser'
import querystring from 'querystring'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltEmblinkIdentifiers'

class CoreEmblinkStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    this.compose = Object.freeze({
      active: false,
      serviceId: null,
      payload: null
    })

    this.open = Object.freeze({
      serviceId: null,
      payload: null
    })

    /* ****************************************/
    // Compose
    /* ****************************************/

    /**
    * @return true if there is a compose item
    */
    this.hasCompose = () => { return this.compose.active }

    /**
    * @return true if the compose has a payload
    */
    this.composeHasPayload = () => { return !!this.compose.payload }

    /**
    * @return true if compose has a mailbox and service
    */
    this.composeHasMailbox = () => { return !!this.compose.serviceId }

    /* ****************************************/
    // Open
    /* ****************************************/

    /**
    * @return true if there is an item to open
    */
    this.hasOpenItem = () => { return !!this.open.serviceId }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,

      handleComposeNewMessage: actions.COMPOSE_NEW_MESSAGE,
      handleClearCompose: actions.CLEAR_COMPOSE,
      handleComposeNewMailtoLink: actions.COMPOSE_NEW_MAILTO_LINK,

      handleOpenItem: actions.OPEN_ITEM,
      handleClearOpenItem: actions.CLEAR_OPEN_ITEM
    })
  }

  /* **************************************************************************/
  // Lifecycle handlers
  /* **************************************************************************/

  handleLoad ({ compose, open }) {
    if (compose) {
      this.compose = Object.freeze(compose)
    }
    if (open) {
      this.open = Object.freeze(open)
    }
  }

  /* **************************************************************************/
  // Mailto Utils
  /* **************************************************************************/

  /**
  * Parses a mailto link into its constituent parts
  * @param mailtoLink: the mailto link to open
  * @return the parsed link or null
  */
  parseMailtoLink (mailtoLink) {
    if (typeof (mailtoLink) !== 'string') { return null }
    if (!mailtoLink.startsWith('mailto:')) { return null }

    try {
      const [recipientStr, queryStr] = mailtoLink.replace('mailto:', '').split('?')
      const recipients = addressparser(decodeURIComponent(recipientStr)).map((r) => r.address)
      const query = querystring.parse(queryStr)

      return {
        valid: true,
        recipient: recipients.join(','),
        subject: query.subject || query.Subject,
        body: query.body || query.Body
      }
    } catch (ex) {
      return null
    }
  }

  /* **************************************************************************/
  // Handlers: Compose
  /* **************************************************************************/

  handleComposeNewMessage ({ serviceId }) {
    this.compose = Object.freeze({
      active: true,
      serviceId: serviceId || null,
      payload: null
    })
  }

  handleClearCompose () {
    this.compose = Object.freeze({
      active: false,
      serviceId: null,
      payload: null
    })
  }

  handleComposeNewMailtoLink ({ mailtoLink, serviceId }) {
    const parsedLink = this.parseMailtoLink(mailtoLink)
    this.compose = Object.freeze({
      active: true,
      serviceId: serviceId || null,
      payload: parsedLink ? {
        original: mailtoLink,
        originalType: 'mailto',
        ...parsedLink
      } : null
    })
  }

  /* **************************************************************************/
  // Handlers: Open
  /* **************************************************************************/

  handleOpenItem ({ serviceId, openPayload }) {
    if (!serviceId) {
      this.preventDefault()
      return
    }

    this.open = Object.freeze({
      serviceId: serviceId,
      payload: openPayload
    })
  }

  handleClearOpenItem () {
    this.open = Object.freeze({
      serviceId: null,
      payload: null
    })
  }
}

export default CoreEmblinkStore
