import UISettings from 'shared/Models/Settings/UISettings'
import DarkTheme from './DarkTheme'
import LightTheme from './LightTheme'
import IndigoTheme from './IndigoTheme'
import TealTheme from './TealTheme'
import NavyTheme from './NavyTheme'

const THEME_MAPPING = Object.freeze({
  [UISettings.THEMES.DARK]: DarkTheme,
  [UISettings.THEMES.LIGHT]: LightTheme,
  [UISettings.THEMES.INDIGO]: IndigoTheme,
  [UISettings.THEMES.TEAL]: TealTheme,
  [UISettings.THEMES.NAVY]: NavyTheme
})

export default THEME_MAPPING
