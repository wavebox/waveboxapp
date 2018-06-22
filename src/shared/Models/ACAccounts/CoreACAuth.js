import CoreACModel from '../CoreACModel'

class CoreACAuth extends CoreACModel {
  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this auth
  * @param parentId: the id of the parent
  * @param namespace: the namespace of the auth
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (parentId, namespace) {
    return {
      parentId: parentId,
      changedTime: new Date().getTime(),
      namespace: namespace
    }
  }

  /**
  * Creates a composite id from the parent and namespace
  * @param parentId: the id of the parent
  * @param namespace: the namespace of the auth
  * @return a composite id
  */
  static compositeId (parentId, namespace) {
    return `${parentId}:${namespace}`
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.constructor.compositeId(this.parentId, this.namespace) }
  get parentId () { return this._value_('parentId') }
  get namespace () { return this._value_('namespace') }

  /* **************************************************************************/
  // Properties: Auth
  /* **************************************************************************/

  get isAuthInvalid () { return this._value_('isAuthInvalid', false) }
  get hasAuth () { return this._value_('hasAuth', false) }
  get authData () { return this._value_('authData', {}) }

  /* **************************************************************************/
  // Properties: Identification
  /* **************************************************************************/

  get displayName () { return this._value_('displayName', undefined) }
  get humanizedNamespace () { return this._value_('humanizedNamespace', this.namespace) }
  get avatarURL () { return this._value_('avatarURL') }
}

export default CoreACAuth
