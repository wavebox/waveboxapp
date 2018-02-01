import React from 'react'

export default class KeychainStorageInfo extends React.Component {
  render () {
    switch (process.platform) {
      case 'darwin':
        return (
          <div {...this.props}>
            Passwords are stored securely in your macOS Keychain
          </div>
        )
      case 'linux':
        return (
          <div {...this.props}>
            Passwords are stored securely in your local libsecret
          </div>
        )
      case 'win32':
        return (
          <div {...this.props}>
            Passwords are stored securely in the local Windows Credential Vault
          </div>
        )
    }
    return false
  }
}
