import CoreGoogleMailServiceData from './CoreGoogleMailServiceData'
import addressparser from 'addressparser'

class GoogleInboxServiceData extends CoreGoogleMailServiceData {
  /**
  * Generates the open data for the message
  * @param thread: the thread to open
  * @param message: the message to open
  */
  generateMessageOpenData (thread, message) {
    const data = {
      serviceId: this.parentId,
      threadId: thread.id,
      messageId: message.id
    }

    let fromAddress
    try { fromAddress = addressparser(message.from)[0].address } catch (ex) { /* no-op */ }
    let toAddress
    try { toAddress = addressparser(message.to)[0].address } catch (ex) { /* no-op */ }
    const afterDate = new Date(parseInt(message.internalDate))
    const beforeDate = new Date(parseInt(message.internalDate) + (1000 * 60 * 60 * 24))

    data.search = [
      fromAddress ? `from:"${fromAddress}"` : undefined,
      toAddress ? `to:${toAddress}` : undefined,
      message.subject ? `subject:"${message.subject}"` : undefined,
      `after:${afterDate.getFullYear()}/${afterDate.getMonth() + 1}/${afterDate.getDate()}`,
      `before:${beforeDate.getFullYear()}/${beforeDate.getMonth() + 1}/${beforeDate.getDate()}`
    ].filter((q) => !!q).join(' ')

    return data
  }
}

export default GoogleInboxServiceData
