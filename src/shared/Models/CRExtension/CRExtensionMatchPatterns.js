class CRExtensionMatchPatterns {
  /**
  * Matches a pattern against a url in chrome launchWindow
  * https://developer.chrome.com/apps/match_patterns
  * @param protocol: the url protocol
  * @param host: the url host
  * @param pathname: the url pathname
  * @param pattern: the pattern to match against
  * @return true if there is a match, false otherwise
  */
  static match (protocol, host, pathname, pattern) {
    if (pattern === '<all_urls>') { return true }
    const regexp = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    const url = `${protocol}//${host}${pathname}`
    return url.match(regexp) !== null
  }
}

module.exports = CRExtensionMatchPatterns
