const Model = require('../Model')

const STATES = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  ACTIVE: 'ACTIVE',
  FINISHED: 'FINISHED',
  FAILED: 'FAILED'
})

class Download extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get STATES () { return STATES }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__data__.id }
  get createdTime () { return this._value_('createdTime', 0) }
  get changedTime () { return this._value_('changedTime', this.createdTime) }
  get state () { return this._value_('state', STATES.UNKNOWN) }

  /* **************************************************************************/
  // Properties: Download
  /* **************************************************************************/

  get url () { return this._value_('url', undefined) }
  get filename () { return this._value_('filename', undefined) }
  get downloadPath () { return this._value_('downloadPath', undefined) }

  /* **************************************************************************/
  // Properties: Progress
  /* **************************************************************************/
  get bytesReceived () { return this._value_('bytesReceived', 0) }
  get bytesTotal () { return this._value_('bytesTotal', 0) }
  get bytesPercent () {
    return this.bytesReceived === 0 || this.bytesTotal === 0
      ? 0
      : (this.bytesReceived / this.bytesTotal) * 100
  }
}

module.exports = Download
