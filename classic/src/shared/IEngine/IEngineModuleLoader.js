class IEngineModuleLoader {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads a module
  * @param src: the source to run
  * @return the module
  */
  static loadModule (src) {
    const module = (function () {
      let module
      const define = function (args, factory) {
        module = factory()
      }
      define.amd = true
      eval(src) // eslint-disable-line
      return module
    })()
    return module.default || module
  }
}

export default IEngineModuleLoader
