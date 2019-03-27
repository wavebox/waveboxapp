import CoreGoogleMailServiceData from './CoreGoogleMailServiceData'

class GoogleMailServiceData extends CoreGoogleMailServiceData {
  /**
  * Generates the open data for the message
  * @param thread: the thread to open
  * @param message: the message to open
  */
  generateMessageOpenData (thread, message) {
    if (thread.version === 2) {
      return {
        serviceId: this.parentId,
        messageId: message.id
      }
    } else {
      return {
        serviceId: this.parentId,
        threadId: thread.id,
        messageId: message.id
      }
    }
  }
}

export default GoogleMailServiceData
