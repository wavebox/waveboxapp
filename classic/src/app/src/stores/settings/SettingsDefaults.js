import { systemPreferences } from 'electron'
import pkg from 'package.json'
import homeDir from 'home-dir'
import fs from 'fs-extra'

class SettingsDefaults {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Generates the themed defaults for the tray
  * @return the defaults
  */
  static generateTrayDefaults () {
    if (process.platform === 'darwin') {
      const isDarkMode = systemPreferences.isDarkMode()
      return {
        isDarkMode: isDarkMode,
        readColor: isDarkMode ? '#FFFFFF' : '#000000',
        readBackgroundColor: 'transparent',
        unreadColor: isDarkMode ? '#FFFFFF' : '#000000',
        unreadBackgroundColor: 'transparent'
      }
    } else if (process.platform === 'win32') {
      // Windows is predominantely dark themed, but with no way to check assume it is
      return {
        isDarkMode: false,
        readColor: '#FFFFFF',
        readBackgroundColor: '#00AEEF',
        unreadColor: '#FFFFFF',
        unreadBackgroundColor: '#00AEEF'
      }
    } else if (process.platform === 'linux') {
      let isDark = false
      // GTK
      try {
        const gtkConf = fs.readFileSync(homeDir('.config/gtk-3.0/settings.ini'), 'utf8')
        if (gtkConf.indexOf('gtk-application-prefer-dark-theme=1') !== -1) {
          isDark = true
        }
      } catch (ex) { }

      return {
        isDarkMode: isDark,
        readColor: '#FFFFFF',
        readBackgroundColor: isDark ? 'transparent' : '#00AEEF',
        unreadColor: '#FFFFFF',
        unreadBackgroundColor: isDark ? 'transparent' : '#00AEEF'
      }
    } else {
      return { }
    }
  }

  /**
  * Generates the app defaults
  * @return the defaults
  */
  static generateAppDefaults () {
    return { ...pkg }
  }

  /**
  * Geneates all defaults
  * @return { app, tray }
  */
  static generateAllDefaults () {
    return {
      app: this.generateAppDefaults(),
      tray: this.generateTrayDefaults()
    }
  }
}

export default SettingsDefaults
