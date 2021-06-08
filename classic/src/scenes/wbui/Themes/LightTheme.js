import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import LightThemeProps from './LightThemeProps'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(LightThemeProps, {})
})
