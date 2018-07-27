class AuthReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'AuthReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Indicates the auth is invalid
  * @param auth: the auth object
  */
  static makeInvalid (auth) {
    if (!auth.isAuthInvalid) {
      return auth.changeData({ isAuthInvalid: true })
    }
  }

  /**
  * Indicates the auth is valid
  * @param auth: the auth object
  */
  static makeValid (auth) {
    if (auth.isAuthInvalid) {
      return auth.changeData({ isAuthInvalid: false })
    }
  }

  /**
  * Indicates there is auth info
  * @param auth: the auth object
  */
  static setHasAuth (auth) {
    if (!auth.hasAuth) {
      return auth.changeData({ hasAuth: true })
    }
  }

  /**
  * Indicates there is no auth info
  * @param auth: the auth object
  */
  static setHasNoAuth (auth) {
    if (auth.hasAuth) {
      return auth.changeData({ hasAuth: false })
    }
  }

  /**
  * Applies a changeset on the auth
  * @param auth: the auth object
  * @param changeset: the changeset to apply
  */
  static updateAuth (auth, changeset) {
    return auth.changeData(changeset)
  }

  /**
  * Sets the auth data
  * @param auth: the auth object
  * @param data: the new auth data
  * @param makeValid=true: true to make the auth data valid at the sametime
  */
  static setAuthData (auth, data) {
    return auth.changeData({
      authData: data,
      hasAuth: true,
      isAuthInvalid: false
    })
  }
}

export default AuthReducer
