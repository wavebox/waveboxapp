import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  button: {
    position: 'relative',
    overflow: 'hidden'
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: '100%',
    cursor: 'pointer'
  }
}

@withStyles(styles)
class FileUploadButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...Button.propTypes,
    inputProps: PropTypes.object,
    onChange: PropTypes.func,
    accept: PropTypes.string,
    webkitdirectory: PropTypes.string,
    disabled: PropTypes.bool
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      inputProps,
      onChange,
      accept,
      className,
      classes,
      children,
      webkitdirectory,
      disabled,
      ...passProps
    } = this.props

    return (
      <Button
        className={classNames(className, classes.button)}
        disabled={disabled}
        {...passProps}>
        {children}
        <input
          type='file'
          className={classes.input}
          webkitdirectory={webkitdirectory}
          disabled={disabled}
          accept={accept}
          onChange={onChange} />
      </Button>
    )
  }
}

export default FileUploadButton
