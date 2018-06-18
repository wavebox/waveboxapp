import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const WAVEBOX_LOGO = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNjAwcHgiIGhlaWdodD0iNjAwcHgiIHZpZXdCb3g9IjAgMCA2MDAgNjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpieD0iaHR0cHM6Ly9ib3h5LXN2Zy5jb20iPiAgPGcgaWQ9IkxheWVyXzYiIHRyYW5zZm9ybT0ibWF0cml4KDEuMTQ4NjQ0LCAwLCAwLCAxLjE0ODY0NCwgLTQ0Ljg1Mzc0OCwgLTUyLjUxMjc3NSkiIGJ4Om9yaWdpbj0iMC41MDUgMC41Ij4gICAgPGc+ICAgICAgPGc+ICAgICAgICA8Y2lyY2xlIGZpbGw9IiNGRkZGRkYiIGN4PSIyOTYiIGN5PSIzMDQuNDE5IiByPSIyMzEuNSIvPiAgICAgICAgPGNpcmNsZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMEFFRUYiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN4PSIyOTYiIGN5PSIzMDQuNDE5IiByPSIyMzEuNSIvPiAgICAgIDwvZz4gICAgPC9nPiAgPC9nPiAgPGcgaWQ9IkxheWVyXzIiIHRyYW5zZm9ybT0ibWF0cml4KDEuMTQ4NjQ0LCAwLCAwLCAxLjE0ODY0NCwgLTQ0Ljg1Mzc0OCwgLTUyLjUxMjc3NSkiIGJ4Om9yaWdpbj0iMC41MTcgMC41MDkiPiAgICA8Zz4gICAgICA8cGF0aCBmaWxsPSIjMDBBRUVGIiBzdHJva2U9IiMwMEFFRUYiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9IiYjMTA7JiM5OyYjOTsmIzk7TTI4NC4wNzUsMTQ2Ljk5MWwtMC4yMTMsNjYuMTQ1bC03My45ODgsMjMuNjY3bDczLjc5OSwzNS4wMDFsLTAuMjEyLDY1LjkwN2wtNzMuOTI1LDM0Ljc5Mmw3My43MzYsMjMuOTg4bC0wLjIxMiw2NS44MDEmIzEwOyYjOTsmIzk7JiM5O2wtMTMxLjg2NS00OS45NDFsMC4yMi02OC4yODlsODMuMjUxLTM5LjM2M2wtODIuOTk3LTM5LjU0bDAuMjItNjguMjlMMjg0LjA3NSwxNDYuOTkxeiIvPiAgICA8L2c+ICAgIDxnPiAgICAgIDxwYXRoIGZpbGw9IiMwMEFFRUYiIHN0cm9rZT0iIzAwQUVFRiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iJiMxMDsmIzk7JiM5OyYjOTtNMzA5LjgxNiw0NjIuNDA4bC0wLjI5Ny02Ni4xNDVsNzMuODA0LTI0LjAxOWwtNzQuMDY3LTM0LjY0OWwtMC4yOTYtNjUuOTA2bDczLjY1NS0zNS4xNDVsLTczLjkxOS0yMy42MzVsLTAuMjk2LTY1LjgwMSYjMTA7JiM5OyYjOTsmIzk7bDEzMi4yNDgsNDkuMzEybDAuMzA3LDY4LjI5bC04Mi45NDUsMzkuNzU5bDgzLjMsMzkuMTQzbDAuMzA3LDY4LjI5TDMwOS44MTYsNDYyLjQwOHoiLz4gICAgPC9nPiAgPC9nPjwvc3ZnPg=='

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    height: 46,
    margin: 6,
    cursor: 'pointer',
    borderRadius: 1,
    boxShadow: '0px 1px 3px 0px #A6A6A6',
    backgroundColor: '#00B5F3',
    color: '#FFFFFF',

    '&:hover, &:focus': {
      boxShadow: '0px 3px 3px 0px #A6A6A6'
    },

    '&:active': {
      backgroundColor: '#008fc0'
    }
  },
  logo: {
    height: 'calc(100% - 4px)',
    width: 'auto',
    paddingTop: 8,
    paddingBottom: 8,
    marginLeft: 2,
    borderRadius: 2
  },
  text: {
    display: 'inline-block',
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    paddingLeft: 12,
    paddingRight: 12
  }
}

@withStyles(styles)
class WaveboxSigninButton extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, classes, ...passProps } = this.props
    return (
      <div
        className={classNames(classes.root, className)}
        {...passProps}>
        <img src={WAVEBOX_LOGO} className={classes.logo} />
        <span className={classes.text}>Sign in with Wavebox</span>
      </div>
    )
  }
}

export default WaveboxSigninButton
