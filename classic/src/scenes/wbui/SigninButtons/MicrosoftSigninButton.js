import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const MICROSOFT_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIgdmlld0JveD0iMCAwIDIxIDIxIj48dGl0bGU+TVMtU3ltYm9sTG9ja3VwPC90aXRsZT48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiBmaWxsPSIjZjI1MDIyIi8+PHJlY3QgeD0iMSIgeT0iMTEiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIGZpbGw9IiMwMGE0ZWYiLz48cmVjdCB4PSIxMSIgeT0iMSIgd2lkdGg9IjkiIGhlaWdodD0iOSIgZmlsbD0iIzdmYmEwMCIvPjxyZWN0IHg9IjExIiB5PSIxMSIgd2lkdGg9IjkiIGhlaWdodD0iOSIgZmlsbD0iI2ZmYjkwMCIvPjwvc3ZnPg=='

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    height: 46,
    margin: 6,
    cursor: 'pointer',

    '&.dark': {
      backgroundColor: '#2F2F2F',
      color: '#FFFFFF',

      '&:hover, &:focus': {
        boxShadow: '0px 1px 3px 0px #A6A6A6'
      },

      '&:active': {
        boxShadow: '0px 1px 3px 0px #A6A6A6',

        '& $text': {
          opacity: 0.9
        }
      }
    },

    '&.light': {
      backgroundColor: '#FFFFFF',
      color: '#5E5E5E',
      border: '1px solid #8C8C8C',

      '&:hover, &:focus': {
        boxShadow: '0px 1px 3px 0px #A6A6A6'
      },

      '&:active': {
        boxShadow: '0px 1px 3px 0px #A6A6A6',

        '& $text': {
          opacity: 0.9
        }
      }
    }
  },
  logo: {
    height: '100%',
    width: 'auto',
    padding: 12
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
class MicrosoftSigninButton extends React.Component {
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
        <img src={MICROSOFT_ICON} className={classes.logo} />
        <span className={classes.text}>Sign in with Microsoft</span>
      </div>
    )
  }
}

export default MicrosoftSigninButton
