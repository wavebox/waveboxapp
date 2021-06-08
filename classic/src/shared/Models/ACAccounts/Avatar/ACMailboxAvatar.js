import CoreACAvatar from './CoreACAvatar'

class ACMailboxAvatar extends CoreACAvatar {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Populates a version from a mailbox and list of services
  * @param mailbox: the mailbox to use
  * @param serviceMap: the full map of services that can be used
  * @param serviceDataMap: the full map of service data's that can be used
  * @param avatarMap: the full map of avatars that can be used
  */
  static autocreate (mailbox, serviceMap, serviceDataMap, avatarMap) {
    const services = mailbox
      .allServices
      .map((id) => serviceMap.get(id))
      .filter((s) => !!s)

    const memberHashes = new Set([mailbox.versionedId])

    const data = {
      color: this._getColor(memberHashes, mailbox, services, serviceDataMap),
      showAvatarColorRing: mailbox.showAvatarColorRing,
      avatarCharacterDisplay: this._getAvatarCharacterDisplay(memberHashes, services),
      rawAvatar: this._getRawAvatar(memberHashes, mailbox, services, avatarMap),
      ...this._getServiceIcons(memberHashes, services)
    }

    data.hashId = Array.from(memberHashes).join(':')
    return data
  }

  /**
  * Gets the color
  * @param memberHashes: the member hashes to add to
  * @param mailbox: the root mailbox
  * @param services: the ordered services list
  * @param serviceDatas: the service datas
  * @return the display name
  */
  static _getColor (memberHashes, mailbox, services, serviceDatas) {
    if (mailbox.color) {
      memberHashes.add(mailbox.versionedId)
      return mailbox.color
    } else {
      let resolvedColor
      (services.find((service) => {
        const serviceData = serviceDatas.get(service.id)
        if (!service || !serviceData) { return false }
        const col = service.getColorWithData(serviceData)
        if (col) {
          resolvedColor = col
          memberHashes.add(service.versionedId)
          return true
        } else {
          return false
        }
      }))

      return resolvedColor
    }
  }

  /**
  * Gets the avatar character display
  * @param memberHashes: the member hashes to add in
  * @param services: the list of serviced ordered
  * @return the character display or undefined
  */
  static _getAvatarCharacterDisplay (memberHashes, services) {
    return (services.find((service) => {
      if (service.serviceAvatarCharacterDisplay !== undefined) {
        memberHashes.add(service.versionedId)
        return true
      }
    }) || {}).serviceAvatarCharacterDisplay
  }

  /**
  * Gets the raw avatar
  * @param memberHashes: the member hashes to add to
  * @param mailbox: the root mailbox
  * @param services: the ordered services list
  * @param avatarMap: the avatar map
  * @return the avatar in the format { uri: '' }, { id: '' }, or undefined
  */
  static _getRawAvatar (memberHashes, mailbox, services, avatarMap) {
    if (mailbox.hasAvatarId) {
      memberHashes.add(mailbox.versionedId)
      return { id: avatarMap.get(mailbox.avatarId) }
    } else {
      // First get a service with a custom avatar
      const serviceWithCustom = services.find((service) => {
        return service.hasAvatarId || service.hasServiceAvatarURL || service.hasServiceLocalAvatarId
      })
      if (serviceWithCustom) {
        memberHashes.add(serviceWithCustom.versionedId)
        if (serviceWithCustom.hasAvatarId) {
          return { id: avatarMap.get(serviceWithCustom.avatarId) }
        } else if (serviceWithCustom.hasServiceLocalAvatarId) {
          return { id: avatarMap.get(serviceWithCustom.serviceLocalAvatarId) }
        } else {
          return { uri: serviceWithCustom.serviceAvatarURL }
        }
      }

      // Finally just fail
      return undefined
    }
  }

  /**
  * Gets the starndard avatar icon for the service type
  * @param memberHashes: the member hashes to add to
  * @param services: the ordered services list
  * @return the avatar in the format { uri: '' } or undefined
  */
  static _getServiceIcons (memberHashes, services) {
    const serviceWithStandard = services.find((service) => {
      return !!service.humanizedLogo
    })
    if (serviceWithStandard) {
      memberHashes.add(serviceWithStandard.versionedId)
      return {
        rawServiceIcon: { uri: serviceWithStandard.humanizedLogo },
        altRawServiceIcons: serviceWithStandard.humanizedLogos.map((uri) => {
          return { uri: uri }
        })
      }
    }

    return undefined
  }
}

export default ACMailboxAvatar
