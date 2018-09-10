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
        // Scale the image down. Never scale up
        const scale = Math.min(1.0, 150 / (image.width > image.height ? image.width : image.height))
        const width = image.width * scale
        const height = image.height * scale

        // Resize the image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, width, height)

        // Done
        cb(canvas.toDataURL())
      }
      image.src = reader.result
    }, false)
    reader.readAsDataURL(evt.target.files[0])
  }
}

export default AccountAvatarProcessor
