import React from 'react'

export default class KeychainStorageInfo extends React.Component {
  render () {
    switch (process.platform) {
      case 'darwin':
        return (
          <span {...this.props}>
            Passwords are stored securely in your macOS Keychain
          </span>
        )
      case 'linux':
        return (
          <span {...this.props}>
            Passwords are stored securely in your local libsecret
          </span>
        )
      case 'win32':
        return (
          <span {...this.props}>
            Passwords are stored securely in the local Windows Credential Vault
          </span>
        )
    }
    return false
  }
}
