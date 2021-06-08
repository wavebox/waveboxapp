const MATCH_ARG_0 = Symbol('MATCH_ARG_0')
const MATCH_ARG_1 = Symbol('MATCH_ARG_1')
const MATCH_ARG_2 = Symbol('MATCH_ARG_2')
const MATCH_ARG_3 = Symbol('MATCH_ARG_3')
const MATCH_ARG_4 = Symbol('MATCH_ARG_4')
const MATCH_ARG_5 = Symbol('MATCH_ARG_5')
const MATCH_ARG_6 = Symbol('MATCH_ARG_6')
const MATCH_ARG_7 = Symbol('MATCH_ARG_7')
const MATCH_ARG_8 = Symbol('MATCH_ARG_8')
const MATCH_ARG_9 = Symbol('MATCH_ARG_9')
const MATCH_ARGS = new Map([
  [MATCH_ARG_0, 0],
  [MATCH_ARG_1, 1],
  [MATCH_ARG_2, 2],
  [MATCH_ARG_3, 3],
  [MATCH_ARG_4, 4],
  [MATCH_ARG_5, 5],
  [MATCH_ARG_6, 6],
  [MATCH_ARG_7, 7],
  [MATCH_ARG_8, 8],
  [MATCH_ARG_9, 9]
])

class ArgParser {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  static get MATCH_ARG_0 () { return MATCH_ARG_0 }
  static get MATCH_ARG_1 () { return MATCH_ARG_1 }
  static get MATCH_ARG_2 () { return MATCH_ARG_2 }
  static get MATCH_ARG_3 () { return MATCH_ARG_3 }
  static get MATCH_ARG_4 () { return MATCH_ARG_4 }
  static get MATCH_ARG_5 () { return MATCH_ARG_5 }
  static get MATCH_ARG_6 () { return MATCH_ARG_6 }
  static get MATCH_ARG_7 () { return MATCH_ARG_7 }
  static get MATCH_ARG_8 () { return MATCH_ARG_8 }
  static get MATCH_ARG_9 () { return MATCH_ARG_9 }

  /* **************************************************************************/
  // Matching
  /* **************************************************************************/

  /**
  * Matches the patterns against the incoming args
  * @param args: an array of args to match
  * @param patterns: a list of patterns to match each in the format { pattern, out/transform }
  *           * when suppling out provide an array of items to output and where you want args placed subsitute with MATCH_ARG_n
  *            .e.g { pattern: ['function'], out: [null, undefined, MATCH_ARG_0] }
  *           * when suppling transform, supply a function that accepts an array of arguments and returns an array of arguments
  * @return an array of matched arguments, or throws
  */
  static match (args, patterns) {
    const signature = args.map((arg) => {
      const type = typeof (arg)
      if (type === 'object') {
        if (Array.isArray(arg)) { return 'array' }
        if (arg === null) { return 'null' }
        return 'object'
      } else {
        return type
      }
    })

    const pattern = patterns.find(({ pattern }) => {
      if (pattern.length !== signature.length) { return false }
      const mismatchIndex = pattern.findIndex((patternItem, index) => {
        if (patternItem === signature[index]) { return false }
        if (patternItem === 'any') { return false }
        return true
      })
      return mismatchIndex === -1
    })
    if (!pattern) {
      throw new Error('Invocation does not match any known patterns')
    }

    if (pattern.out) {
      return pattern.out.map((item) => {
        if (typeof (item) === 'symbol' && MATCH_ARGS.has(item)) {
          return args[MATCH_ARGS.get(item)]
        } else {
          return item
        }
      })
    } else if (pattern.transform) {
      return pattern.transform(args)
    } else {
      return []
    }
  }

  /**
  * Gets the callback from a set of arguments
  * @param args: the array of arguments
  * @return { args, callback } with args being the new array and callback optionally being the callback
  */
  static callback (args) {
    const cb = typeof (args[args.length - 1]) === 'function' ? args[args.length - 1] : undefined
    return {
      args: cb ? args.slice(0, -1) : args,
      callback: cb
    }
  }
}

export default ArgParser
