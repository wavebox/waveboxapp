import WBRPCRenderer from 'shared/WBRPCRenderer'

const privStartInterval = Symbol('privStartInterval')
const privListeners = Symbol('privListeners')
const privPhase = Symbol('privPhase')

const PHASES = {
  PRE_START: 0,
  STARTED: 1,
  ENDED: 2,
  IDLE: 3
}

class CRExtensionRunEvents {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privPhase] = PHASES.PRE_START
    this[privListeners] = new Map([
      [1, []],
      [2, []],
      [3, []]
    ])

    // Document started
    this[privStartInterval] = null

    // Document ended
    WBRPCRenderer.webContents.once('dom-ready', () => {
      this._unbindDocumentStart()
      if (document.readyState === 'complete' && document.documentElement) {
        this._moveToPhase(PHASES.IDLE)
      } else {
        this._moveToPhase(PHASES.ENDED)
      }
    })

    // Document idle (method 1)
    document.addEventListener('readystatechange', (evt) => {
      if (evt.target.readyState === 'complete') {
        this._unbindDocumentStart()
        this._moveToPhase(PHASES.IDLE)
      }
    })
    // Document idle (method 2)
    WBRPCRenderer.webContents.once('did-finish-load', () => {
      if (document.readyState === 'complete' && document.documentElement) {
        this._unbindDocumentStart()
        this._moveToPhase(PHASES.IDLE)
      }
    })

    // In case we late call. Don't trigger this on about:blank as it will always
    // fire.
    if (window.location.href !== 'about:blank' && document.readyState === 'complete' && document.documentElement) {
      this._moveToPhase(PHASES.IDLE)
    }
  }

  /* **************************************************************************/
  // Processors
  /* **************************************************************************/

  /**
  * Moves to the next phase
  * @param nextPhase: the next phase
  */
  _moveToPhase (nextPhase) {
    const prevPhase = this[privPhase]
    if (nextPhase < prevPhase) { return }

    for (let i = prevPhase + 1; i <= nextPhase; i++) {
      if (this[privListeners].has(i)) {
        const listeners = this[privListeners].get(i)
        this[privListeners].delete(i)
        listeners.forEach((l) => l())
      }
    }

    this[privPhase] = nextPhase
  }

  /**
  * Late binds document start to be lighter on resources
  */
  _lateBindDocumentStart () {
    if (this[privStartInterval] === null) {
      this[privStartInterval] = setInterval(() => { // In testing, typically fires 2 or 3 times
        if (document.documentElement) {
          clearInterval(this[privStartInterval])
          this._moveToPhase(PHASES.STARTED)
        }
      })
    }
  }

  /**
  * Unbinds the document start event
  */
  _unbindDocumentStart () {
    clearInterval(this[privStartInterval])
  }

  /* **************************************************************************/
  // Listeners
  /* **************************************************************************/

  /**
  * Binds a document start listener
  * @param listener: the listener to call
  */
  documentStart (listener) {
    if (this[privPhase] < PHASES.STARTED) {
      this[privListeners].get(PHASES.STARTED).push(listener)
      this._lateBindDocumentStart()
    } else {
      listener()
    }
  }

  /**
  * Binds a document end listener
  * @param listener: the listener to call
  */
  documentEnd (listener) {
    if (this[privPhase] < PHASES.ENDED) {
      this[privListeners].get(PHASES.ENDED).push(listener)
    } else {
      listener()
    }
  }

  /**
  * Binds a document idle listener
  * @param listener: the listener to call
  */
  documentIdle (listener) {
    if (this[privPhase] < PHASES.IDLE) {
      this[privListeners].get(PHASES.IDLE).push(listener)
    } else {
      listener()
    }
  }
}

export default CRExtensionRunEvents
