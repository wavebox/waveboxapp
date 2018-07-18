import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import LightThemeProps from './LightThemeProps'
import teal from '@material-ui/core/colors/teal'
import lightBlue from '@material-ui/core/colors/lightBlue'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import amber from '@material-ui/core/colors/amber'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(LightThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: teal[600],
        boxShadow: 'none',
        windowControls: {
          icon: {
            color: teal[200],
            backgroundColor: {
              hover: teal[500]
            }
          }
        },
        upgrade: {
          icon: { color: lightBlue[300] },
          text: { color: '#FFF' },
          popover: {
            backgroundColor: lightBlue[400],
            color: '#FFF'
          }
        },
        whatsnew: {
          icon: {
            color: { default: red[800], hover: red[700] }
          }
        },
        wizard: {
          icon: {
            color: { default: orange[500], hover: orange[300] }
          }
        },
        support: {
          icon: {
            color: { default: teal[900], hover: teal[800] }
          }
        },
        add: {
          icon: {
            color: { default: teal[200], hover: teal[100] }
          }
        },
        settings: {
          icon: {
            color: { default: teal[200], hover: teal[100] }
          }
        },
        expander: {
          icon: {
            color: { default: teal[200], hover: teal[100] }
          }
        }
      },
      toolbar: {
        backgroundColor: teal[600],
        boxShadow: 'none',
        icon: {
          color: {
            default: teal[200],
            hover: teal[100],
            disabled: teal[400]
          }
        },
        text: {
          color: { default: teal[50] }
        },
        spinner: {
          color: amber[600]
        },
        serviceTab: {
          borderBottomColor: {
            default: 'transparent',
            active: teal[50],
            hover: teal[50]
          }
        }
      },
      loadbar: {
        backgroundColor: amber[600]
      }
    }
  })
})
