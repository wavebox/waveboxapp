import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import LightThemeProps from './LightThemeProps'
import yellow from '@material-ui/core/colors/yellow'
import grey from '@material-ui/core/colors/grey'
import red from '@material-ui/core/colors/red'
import lightBlue from '@material-ui/core/colors/lightBlue'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(LightThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: '#00AEEF',
        boxShadow: '1px 0px 2px 0px rgba(0,0,0,0.25)',
        windowControls: {
          icon: {
            color: grey[50],
            backgroundColor: {
              hover: 'rgba(255, 255, 255, 0.2)'
            }
          }
        },
        upgrade: {
          icon: { color: yellow[700] },
          text: { color: grey[50] }
        },
        whatsnew: {
          icon: {
            color: { default: red[700], hover: red[600] }
          }
        },
        wizard: {
          icon: {
            color: { default: yellow[500], hover: yellow[700] }
          }
        },
        add: {
          icon: {
            color: { default: lightBlue[50], hover: lightBlue[100] }
          }
        },
        settings: {
          icon: {
            color: { default: lightBlue[50], hover: lightBlue[100] }
          }
        },
        expander: {
          icon: {
            color: { default: lightBlue[50], hover: lightBlue[100] }
          }
        }
      },
      toolbar: {
        backgroundColor: '#00AEEF',
        icon: {
          color: {
            default: lightBlue[50],
            hover: lightBlue[100],
            disabled: lightBlue[300]
          }
        },
        text: {
          color: { default: lightBlue[50] }
        },
        spinner: {
          color: yellow[600]
        },
        serviceTab: {
          borderBottomColor: {
            default: 'transparent',
            active: lightBlue[50],
            hover: lightBlue[50]
          },
          backgroundColor: {
            default: 'transparent',
            active: 'rgba(255, 255, 255, 0.3)',
            hover: 'rgba(255, 255, 255, 0.3)'
          }
        }
      },
      loadbar: {
        backgroundColor: yellow[900]
      }
    }
  })
})
