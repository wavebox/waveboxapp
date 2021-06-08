import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const GOOGLE_G_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNNDUuMTIgMjQuNWMwLTEuNTYtLjE0LTMuMDYtLjQtNC41SDI0djguNTFoMTEuODRjLS41MSAyLjc1LTIuMDYgNS4wOC00LjM5IDYuNjR2NS41Mmg3LjExYzQuMTYtMy44MyA2LjU2LTkuNDcgNi41Ni0xNi4xN3oiLz48cGF0aCBmaWxsPSIjMzRBODUzIiBkPSJNMjQgNDZjNS45NCAwIDEwLjkyLTEuOTcgMTQuNTYtNS4zM2wtNy4xMS01LjUyYy0xLjk3IDEuMzItNC40OSAyLjEtNy40NSAyLjEtNS43MyAwLTEwLjU4LTMuODctMTIuMzEtOS4wN0g0LjM0djUuN0M3Ljk2IDQxLjA3IDE1LjQgNDYgMjQgNDZ6Ii8+PHBhdGggZmlsbD0iI0ZCQkMwNSIgZD0iTTExLjY5IDI4LjE4QzExLjI1IDI2Ljg2IDExIDI1LjQ1IDExIDI0cy4yNS0yLjg2LjY5LTQuMTh2LTUuN0g0LjM0QTIxLjk5MSAyMS45OTEgMCAwIDAgMiAyNGMwIDMuNTUuODUgNi45MSAyLjM0IDkuODhsNy4zNS01Ljd6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI0IDEwLjc1YzMuMjMgMCA2LjEzIDEuMTEgOC40MSAzLjI5bDYuMzEtNi4zMUMzNC45MSA0LjE4IDI5LjkzIDIgMjQgMiAxNS40IDIgNy45NiA2LjkzIDQuMzQgMTQuMTJsNy4zNSA1LjdjMS43My01LjIgNi41OC05LjA3IDEyLjMxLTkuMDd6Ii8+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTIgMmg0NHY0NEgyeiIvPjwvc3ZnPg=='

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    height: 46,
    margin: 6,
    cursor: 'pointer',
    borderRadius: 3,

    '&.dark': {
      boxShadow: '0px 1px 3px 0px #A6A6A6',
      backgroundColor: '#4285F4',
      color: '#FFFFFF',

      '&:hover, &:focus': {
        boxShadow: '0px 3px 3px 0px #A8BBD8'
      },

      '&:active': {
        backgroundColor: '#366AD3'
      },
      '& $logo': {
        backgroundColor: 'white'
      }
    },

    '&.light': {
      boxShadow: '0px 1px 3px 0px #A6A6A6',
      backgroundColor: '#FFFFFF',
      color: '#757575',

      '&:hover, &:focus': {
        boxShadow: '0px 3px 3px 0px #A8BBD8'
      },

      '&:active': {
        backgroundColor: '#EEEEEE'
      }
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
class GoogleSigninButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    type: PropTypes.oneOf(['light', 'dark']).isRequired
  }

  static defaultProps = {
    type: 'dark'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, classes, type, ...passProps } = this.props
    return (
      <div
        className={classNames(classes.root, className, type)}
        {...passProps}>
        <img src={GOOGLE_G_LOGO} className={classes.logo} />
        <span className={classes.text}>Sign in with Google</span>
      </div>
    )
  }
}

export default GoogleSigninButton
