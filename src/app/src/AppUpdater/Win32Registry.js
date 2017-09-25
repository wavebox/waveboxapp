import Registry from 'winreg'

class Win32Registry {
  /**
  * @param exePath: the path to the exe
  * @return the installer manifest
  */
  static manifest (exePath) {
    return [
      {
        path: '\\SOFTWARE\\Classes\\Wavebox.Url.mailto',
        name: 'FriendlyTypeName',
        value: 'Wavebox Url'
      },
      {
        path: '\\SOFTWARE\\Classes\\Wavebox.Url.mailto\\shell\\open\\command',
        name: '',
        value: `${exePath} %1`
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox',
        name: '',
        value: 'Wavebox'
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox',
        name: 'LocalizedString',
        value: `${exePath},-123`
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\DefaultIcon',
        name: '',
        value: `${exePath},1`
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Capabilities',
        name: 'ApplicationName',
        value: 'Wavebox'
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Capabilities',
        name: 'ApplicationDescription',
        value: 'All your web communication tools together for faster, smarter working'
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Capabilities\\StartMenu',
        name: 'Mail',
        value: 'Wavebox'
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Capabilities\\URLAssociations',
        name: 'mailto',
        value: 'Wavebox.Url.mailto'
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Protocols\\mailto',
        name: '',
        value: 'URL:MailTo Protocol'
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Protocols\\DefaultIcon',
        name: '',
        value: `${exePath},1`
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\Protocols\\mailto\\shell\\open\\command',
        name: '',
        value: `${exePath} %1`
      },
      {
        path: '\\SOFTWARE\\Clients\\Mail\\Wavebox\\shell\\open\\command',
        name: '',
        value: `${exePath}`
      },
      {
        path: '\\SOFTWARE\\RegisteredApplications',
        name: 'Wavebox',
        value: 'Software\\Clients\\Mail\\Wavebox\\Capabilities'
      }
    ]
  }

  /**
  * Adds the manifest entries
  * @param execPath: the path to the exe
  * @return promise
  */
  static addManifestEntries (execPath) {
    return this.manifest(execPath).reduce((acc, item) => {
      return acc.then(() => {
        return new Promise((resolve, reject) => {
          const key = new Registry({ hive: Registry.HKCU, key: item.path })
          key.set(item.name, Registry.REG_SZ, item.value, (err) => {
            err ? reject(err) : resolve()
          })
        })
      })
    }, Promise.resolve())
  }

  /**
  * Removes the manifest entries
  * @param execPath: the path to the exe
  * @param skipErrors=true: false to reject() on the first error
  * @return promise
  */
  static removeManifestEntries (execPath, skipErrors = true) {
    return this.manifest(execPath).reduce((acc, item) => {
      return acc.then(() => {
        return new Promise((resolve, reject) => {
          const key = new Registry({ hive: Registry.HKCU, key: item.path })
          key.remove(item.name, (err) => {
            err && skipErrors === false ? reject(err) : resolve()
          })
        })
      })
    }, Promise.resolve())
  }
}

export default Win32Registry
