(function () {
  const BrowserNotification = window.Notification
  window.Notification = new Proxy(BrowserNotification, {
    construct: function (Target, argumentsList, newTarget) {
      const notificationProxy = new Proxy(new Target(...argumentsList), {
        get: function (target, name) {
          if (name === 'onclick') {
            return target.__onclick__
          } else {
            return target[name]
          }
        },
        set: function (target, name, value) {
          if (name === 'onclick') {
            target.__onclick__ = value
            target[name] = function (evt) {
              if (typeof (value) === 'function') {
                value.apply(target, Array.from(arguments))
              }
              if (!evt.defaultPrevented) {
                window.postMessage(JSON.stringify({ wavebox: true, type: 'wavebox-notification-click' }), '*')
              }
            }
            return
          }
          target[name] = value
        }
      })
      notificationProxy.onclick = undefined
      return notificationProxy
    },
    get: function (Target, k) {
      return Target[k]
    },
    set: function (Target, k, v) {
      Target[k] = v
    }
  })
})()
