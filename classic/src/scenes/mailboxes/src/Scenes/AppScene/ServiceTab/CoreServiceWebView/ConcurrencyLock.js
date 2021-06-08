import { EventEmitter } from 'events'
import os from 'os'
import { settingsStore } from 'stores/settings'

const privMaxConcurrentLoads = Symbol('privMaxConcurrentLoads')
const privState = Symbol('privState')
const privEmitBatcher = Symbol('privEmitBatcher')

const privRecId = Symbol('privRecId')
const privRecLoadStartCallback = Symbol('privRecLoadStartCallback')
const privRecLoadingTimeout = Symbol('privRecLoadingTimeout')
const privRecStage = Symbol('privRecStage')
const privDeferEmitChangedEventTimeout = Symbol('privDeferEmitChangedEventTimeout')

const MAX_LOAD_TIME = 30000
const STAGES = {
  UNKNOWN: 'UNKNOWN',
  WAITING: 'WAITING',
  LOADING: 'LOADING',
  LOADED: 'LOADED'
}

/* **************************************************************************/
//
// Class
// ConcurrencyRec
//
/* **************************************************************************/
class ConcurrencyRec {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param id: the instance id
  */
  constructor (id) {
    this[privRecId] = id
    this[privRecLoadStartCallback] = undefined
    this[privRecLoadingTimeout] = null
    this[privRecStage] = STAGES.UNKNOWN
  }

  /**
  * Destroys the record
  */
  destroy () {
    this[privRecLoadStartCallback] = undefined
    clearTimeout(this[privRecLoadingTimeout])
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this[privRecId] }
  get stage () { return this[privRecStage] }

  /* **************************************************************************/
  // Stage transition
  /* **************************************************************************/

  /**
  * Starts the waiting stage
  * @param loadStartCallback: callback to execute when load start can begin
  */
  startWaitingStage (loadStartCallback) {
    if (this.stage !== STAGES.UNKNOWN) {
      throw new Error(`Invalid stage path. Cannot transition from ${this.stage} to WAITING`)
    }
    this[privRecStage] = STAGES.WAITING
    this[privRecLoadStartCallback] = loadStartCallback
  }

  /**
  * Starts the loading stage
  * @param loadTimeout: the loading timeout timer
  */
  startLoadingStage (loadTimeout) {
    if (this.stage !== STAGES.UNKNOWN && this.stage !== STAGES.WAITING) {
      throw new Error(`Invalid stage path. Cannot transition from ${this.stage} to LOADING`)
    }
    this[privRecStage] = STAGES.LOADING
    clearTimeout(this[privRecLoadingTimeout])
    this[privRecLoadingTimeout] = loadTimeout
    if (this[privRecLoadStartCallback]) {
      this[privRecLoadStartCallback]()
      this[privRecLoadStartCallback] = undefined
    }
  }

  /**
  * Starts the loaded stage
  */
  startLoadedStage () {
    if (this.stage !== STAGES.LOADING) {
      throw new Error(`Invalid stage path. Cannot transition from ${this.stage} to LOADED`)
    }
    this[privRecStage] = STAGES.LOADED
    clearTimeout(this[privRecLoadingTimeout])
    this[privRecLoadingTimeout] = null
  }
}

/* **************************************************************************/
//
// Class
// ConcurrencyLock
//
/* **************************************************************************/
class ConcurrencyLock extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this[privState] = new Map()
    this[privEmitBatcher] = null
    this[privDeferEmitChangedEventTimeout] = null

    const settingsState = settingsStore.getState()
    this[privMaxConcurrentLoads] = settingsState.launched.app.concurrentServiceLoadLimitIsAuto
      ? this.machineCPUCount
      : settingsState.launched.app.concurrentServiceLoadLimitIsNone
        ? Infinity
        : settingsState.launched.app.concurrentServiceLoadLimit
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get machineCPUCount () {
    try {
      const cpus = os.cpus().length
      return cpus === 0 ? 2 : cpus
    } catch (ex) {
      return 2
    }
  }
  get maxConcurrentLoads () { return this[privMaxConcurrentLoads] }
  get hasFreeLockSlot () { return this.loadingCount < this.maxConcurrentLoads }
  get waitingRecs () { return Array.from(this[privState].values()).filter((r) => r.stage === STAGES.WAITING) }
  get waitingCount () { return this.waitingRecs.length }
  get loadingRecs () { return Array.from(this[privState].values()).filter((r) => r.stage === STAGES.LOADING) }
  get loadingCount () { return this.loadingRecs.length }
  get loadedRecs () { return Array.from(this[privState].values()).filter((r) => r.stage === STAGES.LOADED) }
  get loadedCount () { return this.loadedRecs.length }

  /* **************************************************************************/
  // Lock lifecyle
  /* **************************************************************************/

  /**
  * Requests a load lock for an id
  * @param id: the id of the instance
  * @param lockReadyCallback: a callback to execute if the lock cannot be vended immediately
  * @return true if the lock is granted immediately, false otherwise
  */
  requestLoadLock (id, lockReadyCallback) {
    // If we already have a concurrency lock then bin it
    this.destroyLoadLock(id)

    const rec = new ConcurrencyRec(id)
    if (this.hasFreeLockSlot) {
      rec.startLoadingStage(this._generateLoadingTimeout(id))
      this[privState].set(id, rec)
      this._deferEmitChangedEvent()
      return true
    } else {
      rec.startWaitingStage(lockReadyCallback)
      this[privState].set(id, rec)
      this._deferEmitChangedEvent()
      return false
    }
  }

  /**
  * Forces a lock, ignoring the current machine restrictions
  * @param id: the id of the instance
  * @return true to indicate the lock is aquired
  */
  forceLoadLock (id) {
    // If we already have a concurrency lock then bin it
    this.destroyLoadLock(id)

    const rec = new ConcurrencyRec(id)
    rec.startLoadingStage(this._generateLoadingTimeout(id))
    this[privState].set(id, rec)
    this._deferEmitChangedEvent()
    return true
  }

  /**
  * Indicates that a load lock has now loaded
  * @param id: the of the instance
  */
  loadLockLoaded (id) {
    const rec = this[privState].get(id)
    if (rec && rec.stage === STAGES.LOADING) {
      rec.startLoadedStage()
      this._emitFreeLockSlots()
      this._deferEmitChangedEvent()
    }
  }

  /**
  * Destroys a load lock, either because the component is unmounted or it's now sleeping etc
  * @param id: the id of the instance
  */
  destroyLoadLock (id) {
    if (this[privState].has(id)) {
      this[privState].get(id).destroy()
      this[privState].delete(id)
      this._emitFreeLockSlots()
      this._deferEmitChangedEvent()
    }
  }

  /* **************************************************************************/
  // Lock utils
  /* **************************************************************************/

  /**
  * Generates a loading timeout
  * @param id: the id of the record this timeout is for
  * @return a timer
  */
  _generateLoadingTimeout (id) {
    return setTimeout(() => {
      if (this[privState].has(id)) {
        const rec = this[privState].get(id)
        if (rec.stage === STAGES.LOADING) {
          rec.startLoadedStage()
          this._emitFreeLockSlots()
          this._deferEmitChangedEvent()
        }
      }
    }, MAX_LOAD_TIME)
  }

  /**
  * Indicates there could be free slots, checks and emits to the any waiting listeners
  */
  _emitFreeLockSlots () {
    // Batch the emit up. You can end up in the state where you have...
    // 3 locks in use, 3 pending locks
    // 6 locks free total
    //   first 3 free, emit to 1 pending
    //   1 pending starts loading to just free immediately. Repeat 3 times
    // Not disasterous but a complete waste of resources. The timeout stack
    // here makes sure that all concurrent edits happen before the emits dequeue
    clearTimeout(this[privEmitBatcher])
    this[privEmitBatcher] = setTimeout(() => {
      this.waitingRecs.find((rec) => {
        if (this.hasFreeLockSlot) {
          rec.startLoadingStage(this._generateLoadingTimeout(rec.id))
          this._deferEmitChangedEvent()
          return false
        } else {
          return true // stop
        }
      })
    })
  }

  /**
  * Emits a changed event after a short amount of time
  */
  _deferEmitChangedEvent () {
    clearTimeout(this[privDeferEmitChangedEventTimeout])
    this[privDeferEmitChangedEventTimeout] = setTimeout(() => {
      this.emit('changed', { sender: this })
    }, 10)
  }
}

export default ConcurrencyLock
