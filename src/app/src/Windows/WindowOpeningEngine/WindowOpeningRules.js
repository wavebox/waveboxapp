import UrlPattern from 'url-pattern'

const privVersion = Symbol('privVersion')
const privRuleset = Symbol('privRuleset')
const privDefaultRule = Symbol('privDefaultRule')

class WindowOpeningRules {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * Expands the import statements in the ruleset
  * @param ruleset: the ruleset to process
  * @return a new ruleset with import statements resolved
  */
  static resolveRulesetImports (ruleset) {
    // Deep copy so we can update
    ruleset = JSON.parse(JSON.stringify(ruleset))

    // Make an index of named members
    const named = new Map()
    ruleset.forEach((site) => {
      if (site.name) {
        named.set(site.name, site)
      }
    })

    // Replace the imports with the named members
    // Update in-situ so we don't have to depth resolve anyone
    ruleset.forEach((site) => {
      site.matches = site.matches.reduce((acc, match) => {
        if (typeof (match) === 'string') {
          const importedMatches = (named.get(match) || {}).matches
          return importedMatches ? acc.concat(importedMatches) : acc
        } else {
          return acc.concat(match)
        }
      }, [])
    })

    // Re-clone the ruleset to break any import deps
    return JSON.parse(JSON.stringify(ruleset))
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param version: the version of the ruleset
  * @param ruleset: the raw ruleset
  */
  constructor (version, ruleset) {
    this[privVersion] = version

    const resolvedRuleset = this.constructor.resolveRulesetImports(ruleset)

    this[privRuleset] = resolvedRuleset.filter((r) => !r.isDefault)
    this[privDefaultRule] = resolvedRuleset.find((r) => r.isDefault)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get version () { return this[privVersion] }

  /* ****************************************************************************/
  // Matching
  /* ****************************************************************************/

  /**
  * Gets the matching open mode
  * @param matchTask: the task to match against
  * @return the matching mode or undefined
  */
  getMatchingMode (matchTask) {
    const match = this._getMatchingRule(matchTask)
    return match ? match.mode.toUpperCase() : undefined
  }

  /**
  * Finds a rule that we can match against
  * @param matchTask: the task to match against
  * @return { site, rule, mode } or undefined
  */
  _getMatchingRule (matchTask) {
    let match
    this[privRuleset].find((site) => {
      const matchedRule = this._getMatchingSiteRule(site, matchTask)
      if (matchedRule) {
        match = {
          site: site,
          rule: matchedRule,
          mode: matchedRule.mode
        }
        return true
      } else {
        return false
      }
    })

    if (match) {
      return match
    } else if (this[privDefaultRule]) {
      const defaultMatchedRule = this._getMatchingSiteRule(this[privDefaultRule], matchTask)
      if (defaultMatchedRule) {
        return {
          site: this[privDefaultRule],
          rule: defaultMatchedRule,
          mode: defaultMatchedRule.mode
        }
      }
    }

    return undefined
  }

  /**
  * Gets the matching rule in a site config
  * @param site: the site to match agaisnt
  * @param matchTask: the task to match against
  * @return the matching rule if found or undefined if nothing matched
  */
  _getMatchingSiteRule (site, matchTask) {
    try {
      if (!site.isDefault) {
        if (!site.url) { return undefined }
        if (!this._doesPatternMatch(site.url, matchTask.currentUri)) { return undefined }
      }
      return site.matches.find((match) => {
        return this._doesSiteRuleMatch(match, matchTask)
      })
    } catch (ex) {
      return undefined
    }
  }

  /**
  * Checks to see if a single match rule matches
  * @param match: the match to check against
  * @param matchTask: the task to match against
  * @return true if the rule matches, false otherwise
  */
  _doesSiteRuleMatch (match, matchTask) {
    try {
      // Url
      if (!this._doesPatternMatch(match.url, matchTask.targetUri)) { return false }

      // Window Opening Type
      if (match.windowType !== undefined) {
        if (Array.isArray(match.windowType)) {
          if (!(matchTask.windowType in match.windowType)) { return false }
        } else if (typeof (match.windowType) === 'string') {
          if (match.windowType !== matchTask.windowType) { return false }
        } else {
          return false
        }
      }

      // Disposition (Optional)
      if (match.disposition !== undefined) {
        if (match.disposition !== matchTask.disposition) { return false }
      }

      // TargetUrl (Optional)
      if (match.targetUrl) {
        if (matchTask.hasProvisionalTargetUrl) {
          if (!this._doesPatternMatch(match.targetUrl, matchTask.provisionalTargetUri)) { return false }
        } else {
          return false
        }
      }

      // Query (Optional)
      if (match.query) {
        const query = matchTask.targetUrlQuery
        const mismatch = Object.keys(match.query).find((k) => {
          if (query[k] === undefined) { return true }
          if (!this._doesPatternMatch(match.query[k], query[k])) { return true }
          return false
        })
        if (mismatch) { return false }
      }

      // Query Excludes (Optional)
      if (match.queryExcludes) {
        const query = matchTask.targetUrlQuery
        const mismatch = Object.keys(match.queryExcludes).find((k) => {
          if (query[k] === undefined) { return false }
          if (this._doesPatternMatch(match.queryExcludes[k], query[k])) { return true }
          return false
        })
        if (mismatch) { return false }
      }

      // Hash
      if (match.hash) {
        if (!this._doesPatternMatch(match.hash, matchTask.targetUrlHash)) { return false }
      }

      // Nothing caused us to quit, so we matched!
      return true
    } catch (ex) {
      return false
    }
  }

  /**
  * Matches a pattern
  * @param patternStr: the pattern to match against
  * @param test: the test string to try
  * @return true if they match, false otherwise
  */
  _doesPatternMatch (patternStr, test) {
    const pattern = new UrlPattern(patternStr)
    return pattern.match(test) !== null
  }
}

export default WindowOpeningRules
