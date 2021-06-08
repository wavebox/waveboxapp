import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import DarkThemeProps from './DarkThemeProps'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(DarkThemeProps, {})
})
