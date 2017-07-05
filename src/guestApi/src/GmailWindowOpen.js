(function () {
  // Utils
  const getQSArg = function (url, key, defaultValue = undefined) {
    const regex = new RegExp('[\\?&]' + key + '=([^&#]*)')
    const results = regex.exec(url)
    return results === null ? defaultValue : results[1]
  }

  // Alert Patches
  const defaultAlertFn = window.alert
  window.alert = (message, title) => {
    if (message.indexOf('Grrr!') === 0) {
      return undefined
    } else {
      return defaultAlertFn(message, title)
    }
  }

  // Open patches
  const defaultOpenFn = window.open
  window.open = function () {
    // Open message in new window -- old style
    if (arguments[0] === '' && arguments[1] === '_blank') {
      return {
        document: {
          write: function (value) {
            const parser = new window.DOMParser()
            const xml = parser.parseFromString(value, 'text/xml')
            if (xml.firstChild && xml.firstChild.getAttribute('HTTP-EQUIV') === 'refresh') {
              const content = xml.firstChild.getAttribute('content')
              const url = content.replace('0; url=', '')
              return defaultOpenFn(url)
            }
          }
        }
      }
    } else if (arguments[0].indexOf('ui=2') !== -1 && arguments[0].indexOf('view=btop') !== -1) {
      // "In New Window" button (toolbar next to print)
      const ik = window.GLOBALS[9]
      const currentUrlMsgId = window.location.hash.split('/').pop().replace(/#/, '').split('?')[0]
      const th = getQSArg(arguments[0], 'th', currentUrlMsgId)

      const args = Array.from(arguments)
      args[0] = `https://mail.google.com/mail?ui=2&view=lg&ik=${ik}&msg=${th}`
      return defaultOpenFn.apply(window, args)
    } else {
      return defaultOpenFn.apply(window, Array.from(arguments))
    }
  }
})()
