import SettingsIdent from '../../../Models/Settings/SettingsIdent'
import AcceleratorSettingsActions from './AcceleratorSettingsActions'
import AppSettingsActions from './AppSettingsActions'
import ExtensionSettingsActions from './ExtensionSettingsActions'
import LanguageSettingsActions from './LanguageSettingsActions'
import OSSettingsActions from './OSSettingsActions'
import TraySettingsActions from './TraySettingsActions'
import UISettingsActions from './UISettingsActions'

const settingsSubactionsFactory = function (actions) {
  return {
    [SettingsIdent.SEGMENTS.ACCELERATORS]: new AcceleratorSettingsActions(actions),
    [SettingsIdent.SEGMENTS.APP]: new AppSettingsActions(actions),
    [SettingsIdent.SEGMENTS.EXTENSION]: new ExtensionSettingsActions(actions),
    [SettingsIdent.SEGMENTS.LANGUAGE]: new LanguageSettingsActions(actions),
    [SettingsIdent.SEGMENTS.OS]: new OSSettingsActions(actions),
    [SettingsIdent.SEGMENTS.TRAY]: new TraySettingsActions(actions),
    [SettingsIdent.SEGMENTS.UI]: new UISettingsActions(actions)
  }
}

export default settingsSubactionsFactory
export {
  AcceleratorSettingsActions,
  AppSettingsActions,
  ExtensionSettingsActions,
  LanguageSettingsActions,
  OSSettingsActions,
  TraySettingsActions,
  UISettingsActions,
  settingsSubactionsFactory
}
