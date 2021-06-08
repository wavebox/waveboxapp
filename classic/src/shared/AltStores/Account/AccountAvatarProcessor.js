class AccountAvatarProcessor {
  /**
  * Processes an avatar file upload
  * @param evt: the dom event that fires
  * @param cb: executed with the processed avatar
  */
  static processAvatarFileUpload (evt, cb) {
    if (!evt.target.files[0]) { return }

    // Load the image
    const reader = new window.FileReader()
    reader.addEventListener('load', () => {
      // Get the image size
      const image = new window.Image()
      image.onload = () => {
        cb(this.boundImage(image, 150))
      }
      image.src = reader.result
    }, false)
    reader.readAsDataURL(evt.target.files[0])
  }

  /**
  * Processes a built in file upload
  * @param resolvedPath: the fully resolved path to the image
  * @param cb: exectued with the processed avatar
  */
  static processBuiltinImage (resolvedPath, cb) {
    const image = new window.Image()
    image.onload = () => {
      cb(this.boundImage(image, 150))
    }
    image.src = resolvedPath
  }

  /**
  * Bounds an image to a maximum size
  * @param image: the loaded window.Image
  * @param maxSize: the maximum allowed size of the image
  * @return a data url representation of the resized image
  */
  static boundImage (image, maxSize) {
    // Scale the image down. Never scale up
    const scale = Math.min(1.0, maxSize / (image.width > image.height ? image.width : image.height))
    const width = image.width * scale
    const height = image.height * scale

    // Resize the image
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    return canvas.toDataURL()
  }
}

export default AccountAvatarProcessor
