import { createMuiTheme } from '@material-ui/core/styles'
import MaterialUIThemeProps from './MaterialUIThemeProps'
import ThemeTools from './ThemeTools'
import DarkThemeProps from './DarkThemeProps'
import brown from '@material-ui/core/colors/brown'
import grey from '@material-ui/core/colors/grey'

export default createMuiTheme({
  ...MaterialUIThemeProps,
  ...ThemeTools.mergeTheme(DarkThemeProps, {
    wavebox: {
      sidebar: {
        backgroundColor: brown[700],
        windowControls: {
          icon: {
            color: grey[400],
            backgroundColor: {
              hover: 'rgba(255, 255, 255, 0.2)'
            }
          }
        },
        add: {
          icon: {
            color: { default: grey[400], hover: grey[300] }
          }
        },
        settings: {
          icon: {
            color: { default: grey[400], hover: grey[300] }
          }
        },
        expander: {
          icon: {
            color: { default: grey[400], hover: grey[300] }
          }
        }
      },
      toolbar: {
        backgroundColor: brown[700],
        icon: {
          color: {
            default: grey[400],
            hover: grey[300],
            disabled: grey[600]
          }
        },
        text: {
          color: { default: grey[300] }
        }
      }
    }
  })
})
