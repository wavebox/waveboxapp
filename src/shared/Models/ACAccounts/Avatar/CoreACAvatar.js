import Model from '../../Model'

class CoreACAvatar extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hashId () { return this._value_('hashId') }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get color () { return this._value_('color', '#FFFFFF') }
  get showAvatarColorRing () { return this._value_('showAvatarColorRing', true) }
  get avatarCharacterDisplay () { return this._value_('avatarCharacterDisplay', undefined) }
  get rawAvatar () { return this._value_('rawAvatar', undefined) }
  get hasAvatar () { return !!(this.rawAvatar && (this.rawAvatar.uri || this.rawAvatar.id)) }
  get rawServiceIcon () { return this._value_('rawServiceIcon', undefined) }
  get altRawServiceIcons () { return this._value_('altRawServiceIcons', []) }
  get hasServiceIcon () { return !!(this.rawServiceIcon && (this.rawServiceIcon.uri || this.rawServiceIcon.id)) }

  /**
  * Resolves an image
  * @param raw: the raw image to resolve
  * @param resolver that can be used to resolve local paths
  * @return a resolved avatar
  */
  _resolveRawImage_ (raw, resolver) {
    if (!raw) { return undefined }
    if (raw.uri) {
      if (raw.uri.startsWith('http://') || raw.uri.startsWith('https://')) {
        return raw.uri
      } else {
        return resolver ? resolver(raw.uri) : raw.uri
      }
    } else if (raw.id) {
      return raw.id
    } else {
      return raw
    }
  }

  /**
  * Resolves a raw avatar
  * @param resolver that can be used to resolve local paths
  * @return a resolved avatar
  */
  resolveAvatar (resolver) {
    return this._resolveRawImage_(this.rawAvatar, resolver)
  }

  /**
  * Resolves a raw service icon
  * @param resolver that can be used to resolve local paths
  * @return a resolved avatar
  */
  resolveServiceIcon (resolver) {
    return this._resolveRawImage_(this.rawServiceIcon, resolver)
  }

  /**
  * Resolves a raw service icon with a size
  * @param size: the size to find
  * @param resolver that can be used to resolve local paths
  * @return a resolved avatar or the serviceIcon if none is found
  */
  resolveServiceIconWithSize (size, resolver) {
    const match = this.altRawServiceIcons.find((l) => {
      return (l.uri || '').indexOf(`${size}px`) !== -1
    })
    return this._resolveRawImage_(match || this.rawServiceIcon, resolver)
  }
}

export default CoreACAvatar
