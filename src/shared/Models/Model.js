class Model {
  /* **************************************************************************/
  // Class : Utils
  /* **************************************************************************/

  /**
  * Merges a changeset into a js object
  * @param obj: the object to merge the changes into
  * @param changeset: an object of changes to merge in
  * @return the updated object even though the object is changed in-place
  */
  static mergeJSChangeset (obj, changeset) {
    Object.keys(changeset).forEach((key) => {
      if (typeof (changeset[key]) === 'object' && !Array.isArray(changeset[key]) && changeset[key] !== null) {
        if (!obj[key]) {
          obj[key] = { }
        }
        Model.mergeJSChangeset(obj[key], changeset[key])
      } else {
        if (changeset[key] === undefined) {
          delete obj[key] // JSON.stringify will delete this at some point so mimic that behaviour
        } else {
          obj[key] = changeset[key]
        }
      }
    })
    return obj
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (data) {
    this.__data__ = Object.freeze(JSON.parse(JSON.stringify(data)))
  }

  /* **************************************************************************/
  // Cloning
  /* **************************************************************************/

  /**
  * Clones a copy of the data
  * @return a new copy of the data copied deeply.
  */
  cloneData () {
    return JSON.parse(JSON.stringify(this.__data__))
  }

  /**
  * Clones the data and merges the given changeset
  * @param changeset: { k->v } to merge. Only 1 level deep
  */
  changeData (changeset) {
    return Object.assign(this.cloneData(), changeset)
  }

  /**
  * Clones the data and merges the given changeset n-deep
  * @param changeset: the changeset to merge into the model
  * @return a clone of the underlying data structure with the changes merged into it
  */
  changeDataWithChangeset (changeset) {
    return Model.mergeJSChangeset(this.cloneData(), changeset)
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * @param the key to get
  * @param defaultValue: the value to return if undefined
  * @return the value or defaultValue
  */
  _value_ (key, defaultValue) {
    return this.__data__[key] === undefined ? defaultValue : this.__data__[key]
  }
}

module.exports = Model
