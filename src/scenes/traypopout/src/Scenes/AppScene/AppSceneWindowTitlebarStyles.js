import lightBlue from '@material-ui/core/colors/lightBlue'

let styles

if (process.platform === 'darwin') {
  const CONTROLS_WIDTH = 62
  const CONTROLS_H_SPACE = 5
  const CONTROL_BG = 'rgb(209, 209, 209)'
  const CONTROL_BD = 'rgb(220, 220, 220)'
  const CONTROL_CLOSE_FOCUS_BG = 'rgb(238, 87, 80)'
  const CONTROL_CLOSE_FOCUS_BD = 'rgb(223, 69, 54)'
  const CONTROL_CLOSE_ACTIVE_BG = 'rgb(191, 73, 66)'
  const CONTROL_CLOSE_ACTIVE_BD = 'rgb(174, 54, 47)'
  const CONTROL_MAXIMIZE_FOCUS_BG = 'rgb(207, 207, 207)'
  const CONTROL_MAXIMIZE_FOCUS_BD = 'rgb(184, 184, 184)'
  const CONTROL_MINIMIZE_FOCUS_BG = 'rgb(249, 191, 50)'
  const CONTROL_MINIMIZE_FOCUS_BD = 'rgb(222, 159, 49)'
  const CONTROL_MINIMIZE_ACTIVE_BG = 'rgb(191, 142, 36)'
  const CONTROL_MINIMIZE_ACTIVE_BD = 'rgb(173, 125, 40)'

  styles = {
    titlebar: {
      display: 'flex',
      height: 22,
      zIndex: 1,
      WebkitAppRegion: 'drag',
      borderTop: '1px solid rgb(250, 250, 250)',
      background: 'rgb(246, 246, 246)',

      '& >.title': {
        order: 2,
        width: '100%',
        fontFamily: `HelveticaNeue, 'Helvetica Neue', 'Lucida Grande', Arial, sans-serif`,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'rgb(177, 172, 172)',
        fontSize: '12px',
        lineHeight: '22px',
        marginRight: CONTROLS_WIDTH + CONTROLS_H_SPACE + CONTROLS_H_SPACE
      },
      '& >.controls': {
        order: 1,
        display: 'flex',
        width: CONTROLS_WIDTH,
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: `0px ${CONTROLS_H_SPACE}px`,

        '& >.control': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 12,
          height: 12,
          borderRadius: '50%',
          WebkitAppRegion: 'no-drag',
          cursor: 'pointer',
          border: `1px solid ${CONTROL_BD}`,
          backgroundColor: CONTROL_BG,

          '& >.icon': {
            width: 8,
            height: 8,
            transition: 'none !important',
            visibility: 'hidden'
          },

          '&:hover>.icon': {
            visibility: 'visible'
          },

          '&.close': {
            order: 1,
            '&:active': {
              backgroundColor: CONTROL_CLOSE_ACTIVE_BG,
              borderColor: CONTROL_CLOSE_ACTIVE_BD
            },
            '&:hover': {
              backgroundColor: CONTROL_CLOSE_FOCUS_BG,
              borderColor: CONTROL_CLOSE_FOCUS_BD
            },
            '& >.icon': {
              color: 'rgb(129, 34, 21) !important'
            }
          },
          '&.maximize': {
            order: 3
          },
          '&.minimize': {
            order: 2,
            '&:active': {
              backgroundColor: CONTROL_MINIMIZE_ACTIVE_BG,
              borderColor: CONTROL_MINIMIZE_ACTIVE_BD
            },
            '&:hover': {
              backgroundColor: CONTROL_MINIMIZE_FOCUS_BG,
              borderColor: CONTROL_MINIMIZE_FOCUS_BD
            },
            '& >.icon': {
              left: '1px !important',
              color: 'rgb(153, 87, 21) !important'
            }
          }
        }
      },

      '&.focused': {
        borderTop: '1px solid rgb(246, 246, 246)',
        background: 'linear-gradient(to bottom, rgba(231,229,231,1) 0%,rgba(206,204,206,1) 100%)',

        '& >.title': {
          color: 'rgb(47, 45, 47)'
        },
        '& >.controls': {
          '& >.control': {
            '&.close': {
              backgroundColor: CONTROL_CLOSE_FOCUS_BG,
              borderColor: CONTROL_CLOSE_FOCUS_BD
            },
            '&.maximize': {
              backgroundColor: CONTROL_MAXIMIZE_FOCUS_BG,
              borderColor: CONTROL_MAXIMIZE_FOCUS_BD
            },
            '&.minimize': {
              backgroundColor: CONTROL_MINIMIZE_FOCUS_BG,
              borderColor: CONTROL_MINIMIZE_FOCUS_BD
            }
          }
        }
      }
    }
  }
} else {
  const BAR_SIZE = 30
  const CONTROLS_WIDTH = 90
  const BAR_BG = lightBlue[600]
  const BAR_BG_FOCUS = lightBlue[800]
  const BAR_FG = lightBlue[100]
  const BAR_FG_DIS = lightBlue[400]

  styles = {
    titlebar: {
      display: 'flex',
      zIndex: 1,
      height: BAR_SIZE,
      background: BAR_BG,
      color: BAR_FG,
      // Fix resizing window top on win32 waveboxapp/#684
      ...(process.platform === 'win32' ? {
        '&:before': {
          content: '""',
          position: 'absolute',
          display: 'block',
          top: 1,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          WebkitAppRegion: 'drag'
        }
      } : {
        WebkitAppRegion: 'drag'
      }),

      '& >.title': {
        order: 1,
        width: '100%',
        fontFamily: `'Open Sans', sans-serif`,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '12px',
        lineHeight: `${BAR_SIZE}px`,
        padding: '0px 10px'
      },
      '& >.controls': {
        order: 2,
        display: 'flex',
        width: CONTROLS_WIDTH,
        justifyContent: 'space-between',
        alignItems: 'center',

        '& >.control': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: BAR_SIZE,
          height: BAR_SIZE,
          WebkitAppRegion: 'no-drag',
          cursor: 'pointer',

          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },

          '& >.icon': {
            width: 13,
            height: 13,
            transition: 'none !important',
            color: `${BAR_FG} !important`
          },

          '&.close': {
            order: 3
          },
          '&.maximize': {
            order: 2,
            backgroundColor: 'transparent !important',
            '& >.icon': {
              color: `${BAR_FG_DIS} !important`
            }
          },
          '&.minimize': {
            order: 1
          }
        }
      },

      '&.focused': {
        background: BAR_BG_FOCUS
      }
    }
  }
}

export default styles
