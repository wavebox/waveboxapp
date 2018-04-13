import path from 'path'

class Resolver {
  /**
  * @return the root path to the source
  */
  static sourceRoot () {
    return path.resolve(path.join(__dirname, '../'))
  }

  /**
  * @param name: the name of the file in the content scene
  * @return the full path to the file
  */
  static contentScene (name) {
    return path.resolve(path.join(this.sourceRoot(), 'scenes/content/', name))
  }

  /**
  * @param name: the name of the file in the content scene
  * @return the full path to the file
  */
  static printScene (name) {
    return path.resolve(path.join(this.sourceRoot(), 'scenes/print/', name))
  }

  /**
  * @param name: the name of the file in the mailboxes scene
  * @return the full path to the file
  */
  static mailboxesScene (name) {
    return path.resolve(path.join(this.sourceRoot(), 'scenes/mailboxes/', name))
  }

  /**
  * @param name: the name of the file in the monitor scene
  * @return the full path to the file
  */
  static monitorScene (name) {
    return path.resolve(path.join(this.sourceRoot(), 'scenes/monitor/', name))
  }

  /**
  * @param name: the name of the file in the keychain scene
  * @return the full path to the file
  */
  static keychainScene (name) {
    return path.resolve(path.join(this.sourceRoot(), 'scenes/keychain/', name))
  }

  /**
  * @param name: the name of the file in the traypopout scene
  * @return the full path to the file
  */
  static traypopoutScene (name) {
    return path.resolve(path.join(this.sourceRoot(), 'scenes/traypopout/', name))
  }

  /**
  * @param name: the name of the file in the guest preload repo
  * @return the full path to the file
  */
  static guestPreload (name) {
    return path.resolve(path.join(this.sourceRoot(), 'guest/guest/preload/', name))
  }

  /**
  * @return the full path to the crextension api
  */
  static crExtensionApi () {
    return path.resolve(path.join(this.sourceRoot(), 'crextensionApi/crextensionApi.js'))
  }

  /**
  * @param name: the name of the file in the guest api repo
  * @return the full path to the file
  */
  static guestApi (name) {
    return path.resolve(path.join(this.sourceRoot(), 'guestApi/', name))
  }

  /**
  * @param name: the name of the icon file
  * @return the full path to the file
  */
  static icon (name) {
    return path.resolve(path.join(this.sourceRoot(), 'icons/', name))
  }

  /**
  * @param name: the name of the audio file
  * @return the full path to the file
  */
  static audio (name) {
    return path.resolve(path.join(this.sourceRoot(), 'audio/', name))
  }
}

export default Resolver
