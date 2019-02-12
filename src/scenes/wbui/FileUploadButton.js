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

  /**
   * Loads an uploaded image and fits it within the max size
   * @param fileRef: the html5 file reference
   * @param maxSize=undefined: an optional maximum size to apply
   * @return promise
   */
  static loadAndFitImageBase64 (fileRef, maxSize = undefined) {
    if (!fileRef) {
      return Promise.reject(new Error('No image selected'))
    }

    return new Promise((resolve, reject) => {
      // Load the image
      const reader = new window.FileReader()
      reader.addEventListener('load', () => {
        // Get the image size
        const image = new window.Image()
        image.onload = () => {
          // Scale the image down. Never scale up
          const scale = typeof (maxSize) === 'number'
            ? Math.min(1.0, maxSize / (image.width > image.height ? image.width : image.height))
            : 1
          const width = image.width * scale
          const height = image.height * scale

          // Resize the image
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0, width, height)

          // Done
          resolve(canvas.toDataURL())
        }
        image.src = reader.result
      }, false)
      reader.readAsDataURL(fileRef)
    })
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
