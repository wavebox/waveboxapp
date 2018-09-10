import MaterialUIThemeProps from './MaterialUIThemeProps'
import blueGrey from '@material-ui/core/colors/blueGrey'
import lightBlue from '@material-ui/core/colors/lightBlue'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'
import teal from '@material-ui/core/colors/teal'
import blue from '@material-ui/core/colors/blue'
import cyan from '@material-ui/core/colors/cyan'

export default {
  ...MaterialUIThemeProps,
  wavebox: {
    sidebar: {
      backgroundColor: blueGrey[900],
      boxShadow: 'none',
      windowControls: {
        icon: {
          color: blueGrey[100],
          backgroundColor: {
            hover: blueGrey[700]
          }
        }
      },
      upgrade: {
        icon: { color: lightBlue[400] },
        text: { color: '#FFFFFF' },
        popover: {
          backgroundColor: lightBlue[400],
          color: '#FFF'
        }
      },
      whatsnew: {
        icon: {
          color: { default: red[400], hover: red[100] }
        },
        iconWithNews: {
          color: { default: red[100], hover: red[50] },
          textShadow: `0px 0px 3px ${red[50]}`,
          backgroundColor: red[400]
        }
      },
      wizard: {
        icon: {
          color: { default: amber[600], hover: amber[200] }
        }
      },
      support: {
        icon: {
          color: { default: teal[600], hover: teal[200] }
        }
      },
      add: {
        icon: {
          color: { default: blueGrey[400], hover: blueGrey[200] }
        }
      },
      settings: {
        icon: {
          color: { default: blueGrey[400], hover: blueGrey[200] }
        }
      },
      expander: {
        icon: {
          color: { default: blueGrey[400], hover: blueGrey[200] }
        }
      }
    },
    toolbar: {
      backgroundColor: blueGrey[900],
      boxShadow: 'none',
      icon: {
        color: {
          default: blueGrey[100],
          hover: blueGrey[50],
          disabled: blueGrey[400]
        }
      },
      text: {
        color: { default: blueGrey[50] }
      },
      spinner: {
        color: cyan[200]
      },
      serviceTab: {
        borderBottomColor: {
          default: 'transparent',
          active: '#FFFFFF',
          hover: '#FFFFFF'
        },
        backgroundColor: {
          default: 'transparent',
          active: 'rgba(0, 0, 0, 0.3)',
          hover: 'rgba(0, 0, 0, 0.2)'
        }
      }
    },
    loadbar: {
      backgroundColor: blue[600]
    },
    popover: {
      backgroundColor: 'rgba(34, 34, 34, 0.9)',
      color: '#FFF',
      hr: {
        backgroundGradientColors: '#bcbcbc, #fff, #bcbcbc'
      }
    },
    tourPopover: {
      backgroundColor: lightBlue[400],
      color: '#FFF'
    }
  }
}
