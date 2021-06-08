import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import DarkThemeProps from './DarkThemeProps'
import indigo from '@material-ui/core/colors/indigo'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(DarkThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: indigo[600],
        boxShadow: '1px 0px 2px 0px rgba(0,0,0,0.25)'
      },
      toolbar: {
        backgroundColor: indigo[600],
        boxShadow: '3px 1px 2px 0px rgba(0,0,0,0.25)'
      }
    }
  })
})
