import Model from '../../Model'

class CoreACAvatar extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hashId () { return this._value_('hashId') }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get displayName () { return this._value_('displayName', 'Untitled') }
  get color () { return this._value_('color', '#FFFFFF') }
  get showAvatarColorRing () { return this._value_('showAvatarColorRing', true) }
  get avatarCharacterDisplay () { return this._value_('avatarCharacterDisplay', undefined) }
  get rawAvatar () { return this._value_('rawAvatar', undefined) }
  get hasAvatar () { return !!(this.rawAvatar && (this.rawAvatar.uri || this.rawAvatar.id)) }
  get rawServiceIcon () { return this._value_('rawServiceIcon', undefined) }
  get hasServiceIcon () { return !!(this.rawServiceIcon && (this.rawServiceIcon.uri || this.rawServiceIcon.id)) }

  /**
  * Resolves a raw avatar
  * @param resolver that can be used to resolve local paths
  * @return a resolved avatar
  */
  resolveAvatar (resolver) {
    if (!this.hasAvatar) { return undefined }
    const raw = this.rawAvatar
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
  * Resolves a raw service icon
  * @param resolver that can be used to resolve local paths
  * @return a resolved avatar
  */
  resolveServiceIcon (resolver) {
    if (!this.hasServiceIcon) { return undefined }
    const raw = this.rawServiceIcon
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
}

export default CoreACAvatar
