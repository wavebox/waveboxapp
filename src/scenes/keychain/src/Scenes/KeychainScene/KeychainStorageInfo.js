import React from 'react'

export default class KeychainStorageInfo extends React.Component {
  render () {
    switch (process.platform) {
      case 'darwin':
        return (
          <div {...this.props}>
            Passwords are stored in macOS Keychain and can also be modified from the Keychain Access App
          </div>
        )
      case 'linux':
        return (
          <div {...this.props}>
            Passwords are stored in libsecret and can also be modified using an app such as GNOME Keyring
          </div>
        )
      case 'win32':
        return (
          <div {...this.props}>
            Passwords are stored in the Windows Credential Vault and can also be modified from the Control Panel
          </div>
        )
    }
    return false
  }
}
