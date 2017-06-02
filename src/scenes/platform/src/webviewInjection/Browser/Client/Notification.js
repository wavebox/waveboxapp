(function () {
  const openNotifications = []
  let idAccumulator = 0

  class Notification {
    /* **************************************************************************/
    // Class
    /* **************************************************************************/

    static get permission () {
      //TODO use: DISALLOWED_HTML5_NOTIFICATION_HOSTS
      return 'granted'
    }

    static requestPermission () {
      //TODO use: DISALLOWED_HTML5_NOTIFICATION_HOSTS
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('granted')
        }, 1000)
      })
    }

    /* **************************************************************************/
    // Lifecycle
    /* **************************************************************************/

    constructor (title, options = {}) {
      idAccumulator += 1
      this.__id__ = idAccumulator
      this.__title__ = title
      this.__options__ = Object.freeze(Object.assign({}, options))
      this.__onclick__ = null
      this.__onerror__ = null

      window.postMessage(JSON.stringify({
        wavebox: true,
        type: 'wavebox-notification-present',
        notification: {
          id: this.__id__,
          title: title,
          options: options
        }
      }), '*')
      openNotifications.push(this)
    }

    /* **************************************************************************/
    // Properties
    /* **************************************************************************/

    get actions () { return this.__options__.actions }
    get badge () { return this.__options__.badge }
    get body () { return this.__options__.body } //1
    get data () { return this.__options__.data } //1
    get dir () { return this.__options__.dir }
    get lang () { return this.__options__.lang }
    get tag () { return this.__options__.tag }
    get icon () { return this.__options__.icon } //1
    get image () { return this.__options__.image }
    get requireInteraction () { return this.__options__.requireInteraction } //1
    get silent () { return this.__options__.silent } //1
    get timestamp () { return this.__options__.timestamp } //1
    get title () { return this.__options__.title } //1
    get vibrate () { return this.__options__.vibrate }

    get onclick () { return this.__onclick__ } //1
    set onclick (v) { this.__onclick__ = v } //1
    get onerror () { return this.__onerror__ }
    set onerror (v) { this.__onerror__ = v }

    /* **************************************************************************/
    // Methods
    /* **************************************************************************/

    close () {

    }
  }

  window.Notification = Notification
})()
/*(function () {
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
      window.postMessage(JSON.stringify({ wavebox: true, type: 'wavebox-notification-present' }), '*')
      return notificationProxy
    },
    get: function (Target, k) {
      return Target[k]
    },
    set: function (Target, k, v) {
      Target[k] = v
    }
  })
})()*/
