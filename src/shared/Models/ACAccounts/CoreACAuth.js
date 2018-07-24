import CoreACModel from './CoreACModel'
import SubclassNotImplementedError from './SubclassNotImplementedError'

class CoreACAuth extends CoreACModel {
  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  static get namespace () { SubclassNotImplementedError('CoreACAuth.namespace') }
  static get humanizedNamespace () { SubclassNotImplementedError('CoreACAuth.humanizedNamespace') }

  /**
  * Creates a blank js object that can used to instantiate this auth
  * @param parentId: the id of the parent
  * @param namespace=this.namespace: the namespace of the auth
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (parentId, namespace = this.namespace, authData = {}) {
    return {
      parentId: parentId,
      changedTime: new Date().getTime(),
      namespace: namespace,
      authData: authData,
      hasAuth: Object.keys(authData).length !== 0
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
  // Sandboxing
  /* **************************************************************************/

  get sandboxedPartitionId () { return this._value_('sandboxedPartitionId', undefined) }
  get isForSandboxedPartitionId () { return !!this.sandboxedPartitionId }

  /* **************************************************************************/
  // Properties: Auth
  /* **************************************************************************/

  get isAuthInvalid () { return this._value_('isAuthInvalid', false) }
  get hasAuth () { return this._value_('hasAuth', false) }
  get authData () { return this._value_('authData', {}) }

  /* **************************************************************************/
  // Properties: Identification
  /* **************************************************************************/

  get humanizedNamespace () { return this.constructor.humanizedNamespace }
  get humanizedIdentifier () { SubclassNotImplementedError('CoreACAuth.humanizedIdentifier') }
  get hasHumanizedIdentifier () { return !!this.humanizedIdentifier }
}

export default CoreACAuth
