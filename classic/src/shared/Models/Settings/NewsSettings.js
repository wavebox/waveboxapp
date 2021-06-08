const Model = require('../Model')

class NewsSettings extends Model {
  get hasLatestInfo () { return this.latestTimestamp !== null }
  get latestTimestamp () { return this._value_('latestTimestamp', null) }
  get latestHeadline () { return this._value_('latestHeadline', undefined) }
  get latestSummary () { return this._value_('latestSummary', undefined) }

  get lastSeenTimestamp () { return this._value_('lastSeenTimestamp', null) }
  get hasUnseenNews () {
    if (this.hasLatestInfo) {
      return this.lastSeenTimestamp === null || this.lastSeenTimestamp < this.latestTimestamp
    } else {
      return false
    }
  }
}

module.exports = NewsSettings
