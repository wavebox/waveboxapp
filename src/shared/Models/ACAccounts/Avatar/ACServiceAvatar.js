import CoreACAvatar from './CoreACAvatar'

class ACServiceAvatar extends CoreACAvatar {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Populates a version from a mailbox and list of services
  * @param mailbox: the mailbox to use
  * @param service: the full service to use
  * @param serviceData: the full service data to use
  * @param avatarMap: the full map of avatars that can be used
  */
  static autocreate (mailbox, service, serviceData, avatarMap) {
    return {
      color: service.getColorWithData(serviceData),
      showAvatarColorRing: mailbox.showAvatarColorRing,
      avatarCharacterDisplay: service.serviceAvatarCharacterDisplay,
      rawAvatar: this._getRawAvatar(service, serviceData, avatarMap),
      rawServiceIcon: { uri: service.humanizedLogo },
      altRawServiceIcons: service.humanizedLogos.map((uri) => {
        return { uri: uri }
      }),
      hashId: [mailbox.versionedId, service.versionedId].join(':')
    }
  }

  /**
  * Gets the raw avatar
  * @param service: the service
  * @param serviceData: the service data
  * @param avatarMap: the avatar map
  * @return the avatar in the format { uri: '' }, { id: '' }, or undefined
  */
  static _getRawAvatar (service, serviceData, avatarMap) {
    if (service.hasAvatarId) {
      return { id: avatarMap.get(service.avatarId) }
    } else if (service.hasServiceLocalAvatarId) {
      return { id: avatarMap.get(service.serviceLocalAvatarId) }
    } else {
      return { uri: service.serviceAvatarURL }
    }
  }
}

export default ACServiceAvatar
