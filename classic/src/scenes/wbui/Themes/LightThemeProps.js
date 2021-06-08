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
      scrollbar: {
        track: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        },
        thumb: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          boxShadow: '0 0 2px rgba(0, 0, 0, 0.5)'
        }
      },
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
      },
      downloads: {
        icon: {
          color: { default: blue[600], hover: blue[200] }
        }
      },
      busy: {
        icon: {
          color: { default: blue[600] }
        }
      },
      mailbox: {
        activeIndicator: {
          bar: {
            active: blue[600],
            hover: blue[600]
          },
          banner: {
            active: '#A6A6A6',
            hover: '#A6A6A6',
            bar: {
              active: blue[600],
              hover: blue[600]
            }
          }
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
      backgroundColor: 'rgba(244, 244, 244, 0.95)',
      backgroundGradientColors: 'rgba(244, 244, 244, 0.95), rgba(244, 244, 244, 0.9)',
      boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.3)',
      color: grey[900],
      heading: {
        color: grey[900],
        backgroundGradientColors: 'rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.20)',
        dividerColor: grey[500],
        button: {
          color: grey[900]
        }
      },
      section: {
        subheading: {
          color: 'rgb(43, 192, 252)',
          backgroundColor: 'rgb(196, 196, 196)'
        },
        dividerColor: grey[500],
        listItem: {
          color: grey[900],
          backgroundColor: 'transparent',
          button: {
            color: grey[900],
            backgroundColor: {
              default: 'transparent',
              hover: 'rgba(0, 0, 0, 0.08)'
            }
          }
        },
        scrollThumb: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          boxShadow: '0 0 1px rgba(255, 255, 255, 0.5)'
        }
      }
    },
    tourPopover: {
      backgroundColor: lightBlue[400],
      color: '#FFF'
    }
  }
}
