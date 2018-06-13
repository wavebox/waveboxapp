import uuid from 'uuid'

const privTrackingId = Symbol('privTrackingId')
const privParallelMode = Symbol('privParallelMode')
const privTrackingName = Symbol('privTrackingName')
const privInflight = Symbol('privInflight')
const privResponse = Symbol('privResponse')
const privMetadata = Symbol('privMetadata')

const PARALLEL_MODES = Object.freeze({
  STRICT_SINGLETON: 'STRICT_SINGLETON',
  LAST_WINS: 'LAST_WINS'
})

class ParallelHttpTracker {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get PARALLEL_MODES () { return PARALLEL_MODES }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param parallelMode: the parallel mode to use, which changes the behaviour of storage slightly
  * @param trackingName: a friendly name that identifies this tracker
  */
  constructor (parallelMode, trackingName) {
    this[privParallelMode] = parallelMode
    this[privTrackingId] = null
    this[privTrackingName] = trackingName
    this[privInflight] = false
    this[privMetadata] = undefined
    this[privResponse] = {
      has: false,
      statusCode: null,
      timestamp: 0,
      data: null
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get inflight () { return this[privInflight] }
  get hasData () { return this[privResponse].has }
  get timestamp () { return this[privResponse].timestamp }
  get data () { return this[privResponse].data }
  get statusCode () { return this[privResponse].statusCode }

  get responseAge () { return this.hasData ? new Date().getTime() - this.timestamp : Infinity }
  get inError () { return this.hasData ? (this.statusCode < 200 || this.statusCode > 299) : false }

  set metadata (metadata) { this[privMetadata] = metadata }
  get metadata () { return this[privMetadata] }

  /* **************************************************************************/
  // Modifiers
  /* **************************************************************************/

  /**
  * Starts a fresh request
  * @return the tracking id
  */
  startRequest () {
    if (this[privParallelMode] === PARALLEL_MODES.STRICT_SINGLETON) {
      if (this.inflight) {
        throw new Error(`ParallelHttpTracker:${this[privTrackingName]}: Request already in-flight and parallel mode is "${PARALLEL_MODES.STRICT_SINGLETON}"`)
      } else {
        this[privInflight] = true
        this[privTrackingId] = uuid.v4()
        return this[privTrackingId]
      }
    } else if (this[privParallelMode] === PARALLEL_MODES.LAST_WINS) {
      this[privInflight] = true
      this[privTrackingId] = uuid.v4()
      return this[privTrackingId]
    } else {
      throw new Error(`ParallelHttpTracker:${this[privTrackingName]}: Unknown parallel mode "${this[privParallelMode]}"`)
    }
  }

  /**
  * Finishes a request
  * @param trackingId: the id of the tracking
  * @param statusCode: the http status code
  * @param data: the data that was returned
  */
  finishRequest (trackingId, statusCode, data) {
    if (this[privTrackingId] !== trackingId) { return }

    this[privTrackingId] = null
    this[privInflight] = false
    this[privResponse] = {
      has: true,
      statusCode: statusCode,
      timestamp: new Date().getTime(),
      data: data
    }
  }

  /**
  * Convinience call for finishing a request in a success state
  * @param trackingId: the id of the tracking
  * @param data: the response data
  */
  finishRequestSuccess (trackingId, data) {
    this.finishRequest(trackingId, 200, data)
  }

  /**
  * Convinience call for finishing a request in an error state
  * @param trackingId: the id of the tracking
  * @param statusCode: the http status code
  */
  finishRequestError (trackingId, statusCode) {
    this.finishRequest(trackingId, statusCode, null)
  }
}

export default ParallelHttpTracker
