import AuthReducer from './AuthReducer'

class MicrosoftAuthReducer extends AuthReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MicrosoftAuthReducer' }

  /**
  * @param auth: the auth
  * @param isPersonal: true if it is personal
  */
  static setIsPersonal (auth, isPersonal) {
    return auth.changeDataWithChangeset({
      authData: {
        isPersonalAccount: isPersonal
      }
    })
  }
}

export default MicrosoftAuthReducer
