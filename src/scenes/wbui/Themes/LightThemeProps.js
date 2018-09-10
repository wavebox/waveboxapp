import MaterialUIThemeProps from './MaterialUIThemeProps'
import lightBlue from '@material-ui/core/colors/lightBlue'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import teal from '@material-ui/core/colors/teal'
import grey from '@material-ui/core/colors/grey'
import blue from '@material-ui/core/colors/blue'

export default {
  ...MaterialUIThemeProps,
  wavebox: {
    sidebar: {
      backgroundColor: grey[200],
      boxShadow: '1px 0px 2px 0px rgba(0,0,0,0.25)',
      windowControls: {
        icon: {
          color: grey[700],
          backgroundColor: {
            hover: grey[300]
          }
        }
      },
      upgrade: {
        icon: { color: lightBlue[600] },
        text: { color: grey[800] },
        popover: {
          backgroundColor: lightBlue[400],
          color: '#FFF'
        }
      },
      whatsnew: {
        icon: {
          color: { default: red[400], hover: red[300] }
        },
        iconWithNews: {
          color: { default: red[100], hover: red[50] },
          textShadow: `0px 0px 3px ${red[50]}`,
          backgroundColor: red[400]
        }
      },
      wizard: {
        icon: {
          color: { default: orange[700], hover: orange[500] }
        }
      },
      support: {
        icon: {
          color: { default: teal[700], hover: teal[500] }
        }
      },
      add: {
        icon: {
          color: { default: grey[700], hover: grey[500] }
        }
      },
      settings: {
        icon: {
          color: { default: grey[700], hover: grey[500] }
        }
      },
      expander: {
        icon: {
          color: { default: grey[700], hover: grey[500] }
        }
      }
    },
    toolbar: {
      backgroundColor: grey[200],
      boxShadow: '3px 1px 2px 0px rgba(0,0,0,0.25)',
      icon: {
        color: {
          default: grey[700],
          hover: grey[600],
          disabled: grey[400]
        }
      },
      text: {
        color: { default: grey[600] }
      },
      spinner: {
        color: blue[600]
      },
      serviceTab: {
        borderBottomColor: {
          default: 'transparent',
          active: blue[600],
          hover: blue[600]
        },
        backgroundColor: {
          default: 'transparent',
          active: 'rgba(0, 0, 0, 0.3)',
          hover: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    loadbar: {
      backgroundColor: blue[600]
    },
    popover: {
      backgroundColor: 'rgba(224, 224, 224, 0.9)',
      color: grey[900],
      hr: {
        backgroundGradientColors: '#bcbcbc, #9E9E9E, #bcbcbc'
      }
    },
    tourPopover: {
      backgroundColor: lightBlue[400],
      color: '#FFF'
    }
  }
}
