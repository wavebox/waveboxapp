import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import DarkThemeProps from './DarkThemeProps'
import indigo from '@material-ui/core/colors/indigo'
import grey from '@material-ui/core/colors/grey'
import teal from '@material-ui/core/colors/teal'
import red from '@material-ui/core/colors/red'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(DarkThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: '#5B9ECA',
        windowControls: {
          icon: {
            backgroundColor: {
              hover: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        upgrade: {
          icon: { color: indigo[500] },
          text: { color: '#FFFFFF' }
        },
        whatsnew: {
          icon: {
            color: { default: red[800], hover: red[700] }
          }
        },
        support: {
          icon: {
            color: { default: teal[600], hover: teal[500] }
          }
        },
        add: {
          icon: {
            color: { default: grey[300], hover: grey[200] }
          }
        },
        settings: {
          icon: {
            color: { default: grey[300], hover: grey[200] }
          }
        },
        expander: {
          icon: {
            color: { default: grey[300], hover: grey[200] }
          }
        }
      },
      toolbar: {
        backgroundColor: '#5B9ECA',
        boxShadow: 'none',
        icon: {
          color: {
            default: grey[300],
            hover: grey[200],
            disabled: grey[400]
          }
        },
        text: {
          color: { default: grey[100] }
        },
        spinner: {
          color: indigo[800]
        }
      },
      loadbar: {
        backgroundColor: indigo[800]
      }
    }
  })
})
