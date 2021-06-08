const privSegment = Symbol('privSegment')
const privActions = Symbol('privActions')

class CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param segment: the segment to use
  * @param actions: the actions instance to use
  */
  constructor (segment, actions) {
    this[privSegment] = segment
    this[privActions] = actions
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get actions () { return this[privActions] }

  /* **************************************************************************/
  // Dispatching
  /* **************************************************************************/

  /**
  * @param key: the model key to write
  * @param value: the value to write in
  */
  dispatchUpdate (key, value) {
    this[privActions].mergeSettingsModelChangeset(this[privSegment], key, value)
  }

  /**
  * @param key: the model key to toggle
  */
  dispatchToggle (key) {
    this[privActions].toggleSettingsModelField(this[privSegment], key)
  }

  /**
  * @param key: the model key to remove
  */
  dispatchRemove (key) {
    this[privActions].removeSettingsModelField(this[privSegment], key)
  }
}

export default CoreSettingsActions
