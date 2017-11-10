const path = require('path')

module.exports = {
  /**
  * Strips .. from a path
  * @param p: the path to strip from
  * @return the path with .. replaced as ''
  */
  stripParentMoves: function (p) {
    return p
      .replace(/(\.\.\/)/, '')
      .replace(/(\/\.\.)$/, '')
  },

  /**
  * Scopes a path to a directory
  * @param scopeTo: the path to scope to
  * @param p: the relative path to ensure is scoped
  * @return the path that's scoped or undefined if it can't be scoped
  */
  scopeToDir: function (scopeTo, p) {
    const fullPath = path.normalize(path.join(scopeTo, p))
    if (fullPath.startsWith(scopeTo)) {
      return fullPath
    } else {
      return undefined
    }
  }
}
