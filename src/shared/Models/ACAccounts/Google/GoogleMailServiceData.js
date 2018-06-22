import CoreGoogleMailServiceData from './CoreGoogleMailServiceData'

class GoogleMailServiceData extends CoreGoogleMailServiceData {
  /**
  * Generates the open data for the message
  * @param thread: the thread to open
  * @param message: the message to open
  */
  generateMessageOpenData (thread, message) {
    return {
      serviceId: this.parentId,
      threadId: thread.id,
      messageId: message.id
    }
  }
}

export default GoogleMailServiceData
