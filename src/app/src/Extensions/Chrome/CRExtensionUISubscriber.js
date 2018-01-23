import { webContents } from 'electron'

class CRExtensionUISubscriber { //TODO depricate
  /* ****************************************************************************/
  // Extension Management
  /* ****************************************************************************/

  constructor () {
    this.subscribers = new Set()
  }

  /* ****************************************************************************/
  // Subscription
  /* ****************************************************************************/

  /**
  * Subscribes a webcontents to UI updates
  * @param wc: the webcontents to subscribe
  */
  subscribe (wc) {
    const id = wc.id
    if (this.subscribers.has(id)) { return }

    this.subscribers.add(id)
    wc.on('destroyed', () => { this.subscribers.delete(id) })
  }

  /**
  * Unsubscribes to UI updates
  * @param wc: the webcontents to unsubscribe
  */
  unsubscribe (wc) {
    this.subscribers.remove(wc.id)
  }

  /* ****************************************************************************/
  // Messaging
  /* ****************************************************************************/

  /**
  * Sends a message to all subscribers
  * @param channel: the channel to send the message
  * @param ...args: the arguments to send
  */
  send (channel, ...args) {
    this.subscribers.forEach((id) => {
      const targetWebcontents = webContents.fromId(id)
      if (targetWebcontents) {
        targetWebcontents.send(channel, ...args)
      }
    })
  }
}

export default new CRExtensionUISubscriber()
