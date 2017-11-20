/**
* * https://developer.chrome.com/apps/manifest/version
*/
class CRExtensionVersionParser {
  /**
  * Expands the string into its components
  * @param str: the input string
  * @return [a,b,c,d]
  */
  static _expand (str) {
    if (typeof (str) === 'string') {
      return str.split('.').map((v) => {
        if (v.length > 1 && v[0] === '0') {
          return NaN
        } else {
          return parseInt(v)
        }
      })
    } else {
      return []
    }
  }

  /**
  * Expand the string into its components and return the expanded version
  * @param str: the input string
  * @return [a,b,c,d] or undefined if invalid
  */
  static _validComponents (str) {
    const expanded = this._expand(str)
    if (expanded.length === 0) { return undefined }
    if (expanded.length > 4) { return undefined }

    const invalidIndex = expanded.findIndex((v, pos) => {
      if (isNaN(v)) { return true }
      if (v < 0) { return true }
      if (v > 65535) { return true }

      return false
    })
    if (invalidIndex !== -1) { return undefined }

    return expanded
  }

  /**
  * @param str: the input string
  * @return true if valid, false otherwise
  */
  static isValid (str) {
    const expanded = this._validComponents(str)
    return expanded !== undefined
  }

  /**
  * @param str: the input string
  * @return the valid version of the string or null
  */
  static valid (str) {
    return this.isValid(str) ? str : null
  }

  /**
  * @param strA: the first string to compare
  * @param strB: the second string to compare
  * @return true if A is greater than B
  */
  static gt (strA, strB) {
    const a = this._validComponents(strA)
    const b = this._validComponents(strB)

    if (a === undefined || b === undefined) { return false }

    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const aDel = a[i] || 0
      const bDel = b[i] || 0
      if (aDel === bDel) { continue }
      if (aDel > bDel) { return true }
      if (aDel < bDel) { return false }
    }

    return false
  }
}

module.exports = CRExtensionVersionParser
