const persistence = require('../storage/userStorage')
const { EventEmitter } = require('events')
const { CLIENT_ID, ANALYTICS_ID, CREATED_TIME, CLIENT_TOKEN } = require('../../shared/Models/DeviceKeys')

class UserStore extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this.clientId = persistence.getJSONItem(CLIENT_ID)
    this.clientToken = persistence.getJSONItem(CLIENT_TOKEN)
    this.analyticsId = persistence.getJSONItem(ANALYTICS_ID)
    this.createdTime = persistence.getJSONItem(CREATED_TIME)

    persistence.on(`changed:${CLIENT_ID}`, () => {
      this.clientId = persistence.getJSONItem(CLIENT_ID)
    })
    persistence.on(`changed:${CLIENT_TOKEN}`, () => {
      this.clientToken = persistence.getJSONItem(CLIENT_TOKEN)
    })
    persistence.on(`changed:${ANALYTICS_ID}`, () => {
      this.analyticsId = persistence.getJSONItem(ANALYTICS_ID)
    })
    persistence.on(`changed:${CREATED_TIME}`, () => {
      this.createdTime = persistence.getJSONItem(CREATED_TIME)
    })
  }

  checkAwake () { return true }
}

module.exports = new UserStore()
