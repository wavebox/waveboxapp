class ThemeTools {
  /**
  * Gets a value
  * @param theme: the theme value to get
  * @param path: the path of the value
  * @param defaultValue=undefined: the default value if none is found
  * @return the value or default value
  */
  static getValue (theme, path, defaultValue = undefined) {
    const pathCmp = path.split('.')
    let ptr = theme
    for (let i = 0; i < pathCmp.length; i++) {
      if (ptr[pathCmp[i]]) {
        ptr = ptr[pathCmp[i]]
      } else {
        break
      }
    }

    return ptr || defaultValue
  }

  /**
  * Gets a value with an optional state at the end
  * @param theme: the theme value to get
  * @param path: the path of the value
  * @param state=default: the optional state to get
  * @param defaultValue=undefined: the default value if none is found
  * @return the value or default value
  */
  static getStateValue (theme, path, state = 'default', defaultValue = undefined) {
    const val = this.getValue(theme, path, defaultValue)
    if (typeof (val) === 'object') {
      return val[state] || val.default || defaultValue
    } else {
      return val
    }
  }

  /**
  * Merges a changeset at on depth
  * @param obj: the obj to work on
  * @param changeset: the changeset to merge
  * @return a new theme with changes applied
  */
  static _mergeThemeDepth1 (obj, changeset) {
    Object.keys(changeset).forEach((key) => {
      if (typeof (changeset[key]) === 'object' && !Array.isArray(changeset[key]) && changeset[key] !== null) {
        if (!obj[key]) {
          obj[key] = { }
        }
        this._mergeThemeDepth1(obj[key], changeset[key])
      } else {
        if (changeset[key] === undefined) {
          delete obj[key]
        } else {
          obj[key] = changeset[key]
        }
      }
    })
    return obj
  }

  /**
  * Merges a changeset into a theme
  * @param base: the base theme to merge into (will be copied before merge)
  * @param changeset: the changeset to merge
  * @return a new theme with changes applied
  */
  static mergeTheme (base, changeset) {
    return this._mergeThemeDepth1(JSON.parse(JSON.stringify(base)), changeset)
  }
}

export default ThemeTools
