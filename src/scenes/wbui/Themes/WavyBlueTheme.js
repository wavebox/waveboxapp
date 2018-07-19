import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import DarkThemeProps from './DarkThemeProps'
import blueGrey from '@material-ui/core/colors/blueGrey'
import teal from '@material-ui/core/colors/teal'
import red from '@material-ui/core/colors/red'
import cyan from '@material-ui/core/colors/cyan'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(DarkThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: 'rgb(0,113,158)',
        boxShadow: '1px 0px 2px 0px rgba(0,0,0,0.25)',
        whatsnew: {
          icon: {
            color: { default: red[300], hover: red[200] }
          }
        },
        add: {
          icon: {
            color: { default: blueGrey[200], hover: blueGrey[100] }
          }
        },
        support: {
          icon: {
            color: { default: teal[300], hover: teal[200] }
          }
        },
        settings: {
          icon: {
            color: { default: blueGrey[200], hover: blueGrey[100] }
          }
        },
        expander: {
          icon: {
            color: { default: blueGrey[200], hover: blueGrey[100] }
          }
        }
      },
      toolbar: {
        backgroundColor: 'rgb(0,113,158)',
        boxShadow: '3px 1px 2px 0px rgba(0,0,0,0.25)',
        icon: {
          color: {
            default: blueGrey[100],
            hover: blueGrey[50],
            disabled: blueGrey[400]
          }
        }
      },
      loadbar: {
        backgroundColor: cyan[200]
      }
    }
  })
})
