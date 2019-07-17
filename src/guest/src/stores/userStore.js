import LiveConfig from 'LiveConfig'

class UserStore {
  get analyticsEnabled () { return LiveConfig.launchUserSettings.analyticsEnabled }

  get clientId () { return LiveConfig.launchUserSettings.clientId }
}

export default new UserStore()
