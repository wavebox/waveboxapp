import Model from '../Model'
import SubclassNotImplementedError from './SubclassNotImplementedError'

class CoreACModel extends Model {
  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this object
  * @return a vanilla js object representing the data for this object
  */
  static createJS () { SubclassNotImplementedError('CoreACModel.createJS') }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__data__.id }
  get changedTime () { return this._value_('changedTime', 0) }
  get versionedId () { return `${this.id}:${this.changedTime}` }
  get partitionId () { SubclassNotImplementedError('CoreACModel.partitionId') }
}

export default CoreACModel
