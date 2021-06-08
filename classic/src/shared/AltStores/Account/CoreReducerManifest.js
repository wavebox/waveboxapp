const privNameToReducerIndex = Symbol('privNameToReducerIndex')
const privReducerToNameIndex = Symbol('privReducerToNameIndex')

const IGNORE_METHOD_NAMES = new Set([
  'length',
  'prototype',
  'name'
])

class CoreReducerManifest {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param reducers: an array or reducers to build the index from
  */
  constructor (reducers) {
    this[privNameToReducerIndex] = new Map()
    this[privReducerToNameIndex] = new Map()

    reducers.forEach((ReducerClass) => {
      const className = ReducerClass.name

      const methodNames = new Set()
      let insp = ReducerClass
      while (insp !== null) {
        // We don't want to crawl the methods from the root object. Badly use toString
        // as an indicator that we are in the root object in the inheritance chain
        const inspNames = new Set(Object.getOwnPropertyNames(insp))
        if (inspNames.has('toString')) { break }

        inspNames.forEach((n) => {
          if (!IGNORE_METHOD_NAMES.has(n)) {
            methodNames.add(n)
          }
        })
        insp = Object.getPrototypeOf(insp)
      }

      methodNames.forEach((methodName) => {
        const ident = `${className}.${methodName}`
        const fn = ReducerClass[methodName]
        this[privNameToReducerIndex].set(ident, fn)
        this[privReducerToNameIndex].set(fn, ident)
      })
    })
  }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  /**
  * Gets the reducer function from the name. Only returns valid reducers
  * @param nameOrReducer: the name of the reducer or reducer function
  * @return the function or undefined if not found
  */
  parseReducer (nameOrReducer) {
    if (typeof (nameOrReducer) === 'function') {
      if (this[privReducerToNameIndex].has(nameOrReducer)) {
        return nameOrReducer
      }
    } else if (typeof (nameOrReducer) === 'string') {
      const reducer = this[privNameToReducerIndex].get(nameOrReducer)
      if (reducer) {
        return reducer
      }
    }

    return undefined
  }

  /**
  * Gets the reducer name from the function. Only returns valid reducers
  * @param nameOrReducer: the name of the reducer or reducer function
  * @return the function name or undefined if not found
  */
  stringifyReducer (nameOrReducer) {
    if (typeof (nameOrReducer) === 'function') {
      const name = this[privReducerToNameIndex].get(nameOrReducer)
      if (name) {
        return name
      }
    } else if (typeof (nameOrReducer) === 'string') {
      if (this[privReducerToNameIndex].has(nameOrReducer)) {
        return nameOrReducer
      }
    }

    return undefined
  }
}

export default CoreReducerManifest
