class ExtensionPreprocess {
  /**
  * Wraps a javascript file in the standard wrapper
  * @param js: the js code as a string
  * @param apiKey: the api key that's registered for this module
  * @param config={}: any static onload config that needs to go into the module
  * @return the wrapped module
  */
  static wrapJSModule (js, apiKey, config = {}) {
    return `
      ;(function (WB_API_KEY, WB_CONFIG) {
        ${js}
      })('${apiKey}', ${JSON.stringify(config)})`
  }
}

module.exports = ExtensionPreprocess
