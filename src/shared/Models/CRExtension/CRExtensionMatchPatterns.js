const ALL_URLS_PATTERN = '<all_urls>'

/**
* * https://developer.chrome.com/apps/match_patterns
*/
class CRExtensionMatchPatterns {
  /**
  * Matches a pattern against a url
  * @param protocol: the url protocol
  * @param host: the url host
  * @param pathname: the url pathname
  * @param pattern: the pattern to match against
  * @return true if there is a match, false otherwise
  */
  static matchUrl (protocol, host, pathname, pattern) {
    if (pattern === ALL_URLS_PATTERN) { return true }
    const regexp = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$')
    const url = `${protocol}//${host}${pathname}`
    return url.match(regexp) !== null
  }

  /**
  * Version of matchUrl which accepts multiple patterns
  * @return true if there is a match, false otherwise
  */
  static matchUrls (protocol, host, pathname, patterns) {
    return !!patterns.find((pattern) => {
      return this.matchUrl(protocol, host, pathname, pattern)
    })
  }

  /**
  * @param pattern: the pattern to check
  * @return true if this pattern is a special all-url pattern
  */
  static isAllUrlMatch (pattern) {
    return pattern === ALL_URLS_PATTERN
  }

  /**
  * @param patterns: a list of patterns
  * @return true if one of the pattersn is a special all-url pattern
  */
  static hasAllUrlMatch (patterns) {
    return patterns.indexOf(ALL_URLS_PATTERN) !== -1
  }
}

module.exports = CRExtensionMatchPatterns
