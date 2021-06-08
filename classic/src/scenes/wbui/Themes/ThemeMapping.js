import UISettings from 'shared/Models/Settings/UISettings'
import DarkTheme from './DarkTheme'
import LightTheme from './LightTheme'
import IndigoTheme from './IndigoTheme'
import TealTheme from './TealTheme'
import NavyTheme from './NavyTheme'
import WavyGreenTheme from './WavyGreenTheme'
import WavyBlueTheme from './WavyBlueTheme'
import BoxyPurpleTheme from './BoxyPurpleTheme'
import BoxyBlueTheme from './BoxyBlueTheme'
import WaveboxLightBlueTheme from './WaveboxLightBlueTheme'
import MochaTheme from './MochaTheme'

const THEME_MAPPING = Object.freeze({
  [UISettings.THEMES.DARK]: DarkTheme,
  [UISettings.THEMES.LIGHT]: LightTheme,
  [UISettings.THEMES.INDIGO]: IndigoTheme,
  [UISettings.THEMES.TEAL]: TealTheme,
  [UISettings.THEMES.NAVY]: NavyTheme,
  [UISettings.THEMES.WAVY_GREEN]: WavyGreenTheme,
  [UISettings.THEMES.WAVY_BLUE]: WavyBlueTheme,
  [UISettings.THEMES.BOXY_PURPLE]: BoxyPurpleTheme,
  [UISettings.THEMES.BOXY_BLUE]: BoxyBlueTheme,
  [UISettings.THEMES.WAVEBOX_LIGHT_BLUE]: WaveboxLightBlueTheme,
  [UISettings.THEMES.MOCHA]: MochaTheme
})

export default THEME_MAPPING
