import UISettings from 'shared/Models/Settings/UISettings'
import DarkTheme from './DarkTheme'
import LightTheme from './LightTheme'

const THEME_MAPPING = Object.freeze({
  [UISettings.THEMES.DARK]: DarkTheme,
  [UISettings.THEMES.LIGHT]: LightTheme
})

export default THEME_MAPPING
