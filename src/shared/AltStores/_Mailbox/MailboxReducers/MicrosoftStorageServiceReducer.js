import ServiceReducer from './ServiceReducer'

class MicrosoftStorageServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MicrosoftStorageServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the drive url
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param driveUrl: the web url for the drive link
  */
  static setDriveUrl (mailbox, service, driveUrl) {
    return service.changeData({ driveUrl: driveUrl })
  }
}

export default MicrosoftStorageServiceReducer
