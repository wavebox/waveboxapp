import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import LightThemeProps from './LightThemeProps'
import teal from '@material-ui/core/colors/teal'
import cyan from '@material-ui/core/colors/cyan'
import red from '@material-ui/core/colors/red'
import lightBlue from '@material-ui/core/colors/lightBlue'
import indigo from '@material-ui/core/colors/indigo'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(LightThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: '#73ACB5',
        windowControls: {
          icon: {
            color: teal[900],
            backgroundColor: {
              hover: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        upgrade: {
          icon: { color: indigo[600] },
          text: { color: cyan[50] }
        },
        whatsnew: {
          icon: {
            color: { default: red[900], hover: red[800] }
          },
          iconWithNews: {
            color: { default: red[100], hover: red[50] },
            textShadow: `0px 0px 3px ${red[50]}`,
            backgroundColor: red[400]
          }
        },
        wizard: {
          icon: {
            color: { default: teal[800], hover: teal[700] }
          }
        },
        support: {
          icon: {
            color: { default: teal[800], hover: teal[700] }
          }
        },
        add: {
          icon: {
            color: { default: teal[800], hover: teal[700] }
          }
        },
        settings: {
          icon: {
            color: { default: teal[800], hover: teal[700] }
          }
        },
        expander: {
          icon: {
            color: { default: teal[800], hover: teal[700] }
          }
        }
      },
      toolbar: {
        backgroundColor: '#73ACB5',
        icon: {
          color: {
            default: teal[800],
            hover: teal[700],
            disabled: cyan[800]
          }
        },
        text: {
          color: { default: teal[800] }
        },
        spinner: {
          color: lightBlue[50]
        },
        serviceTab: {
          borderBottomColor: {
            default: 'transparent',
            active: lightBlue[50],
            hover: lightBlue[50]
          },
          backgroundColor: {
            default: 'transparent',
            active: 'rgba(255, 255, 255, 0.1)',
            hover: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      loadbar: {
        backgroundColor: teal[800]
      }
    }
  })
})
