import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import DarkThemeProps from './DarkThemeProps'
import red from '@material-ui/core/colors/red'
import blueGrey from '@material-ui/core/colors/blueGrey'
import cyan from '@material-ui/core/colors/cyan'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(DarkThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: '#7676B0',
        boxShadow: 'none',
        whatsnew: {
          icon: {
            color: { default: red[900], hover: red[800] }
          }
        },
        support: {
          icon: {
            color: { default: cyan[600], hover: cyan[400] }
          }
        },
        add: {
          icon: {
            color: { default: blueGrey[800], hover: blueGrey[700] }
          }
        },
        settings: {
          icon: {
            color: { default: blueGrey[800], hover: blueGrey[700] }
          }
        },
        expander: {
          icon: {
            color: { default: blueGrey[800], hover: blueGrey[700] }
          }
        }
      },
      toolbar: {
        backgroundColor: '#7676B0',
        icon: {
          color: {
            disabled: blueGrey[300]
          }
        }
      },
      loadbar: {
        backgroundColor: cyan[400]
      }
    }
  })
})
