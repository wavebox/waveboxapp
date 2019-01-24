import ServiceReducer from './ServiceReducer'

class SlackServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'SlackServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the basic profile info for this account
  * @param service: the service to update
  * @param teamOverview: the overview of the team
  * @param selfOverview: the overview of the user
  */
  static setTeamAndSelfOverview (service, teamOverview, selfOverview, authUserId) {
    return service.changeData({
      teamOverview: teamOverview,
      selfOverview: selfOverview,
      authUserId: authUserId
    })
  }

  /**
  * Sets whether to tickle the slack rtm channels
  * @param service: the service to change
  * @param tickle: true to tickle, false otherwise
  */
  static setTickleRTM (service, tickle) {
    return service.changeData({ tickleRTM: tickle })
  }
}

export default SlackServiceReducer
