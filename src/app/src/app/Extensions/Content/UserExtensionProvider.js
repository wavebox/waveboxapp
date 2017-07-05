class UserExtensionProvider {
  handleRequest (request, route) {
    return Promise.reject(new Error('Not Implemented'))
  }
}

module.exports = UserExtensionProvider
