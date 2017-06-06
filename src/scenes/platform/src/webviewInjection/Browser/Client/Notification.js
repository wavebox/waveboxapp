/* global WAVEBOX_CONFIG */

(function () {
  const openNotifications = []
  const permissionRequests = new Map()
  let idAcc = 0
  let domainPermission = WAVEBOX_CONFIG.permission

  window.addEventListener('message', function (evt) {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }

      if (data.type === 'wavebox-notification-clicked') {
        const notificationIndex = openNotifications.findIndex((n) => n.__id__ === data.notificationId)
        if (notificationIndex !== -1) {
          const notification = openNotifications[notificationIndex]
          openNotifications.splice(notificationIndex, 1)
          if (notification.onclick && typeof (notification.onclick) === 'function') {
            const event = {
              bubbles: false,
              cancelBubble: false,
              cancelable: false,
              composed: false,
              currentTarget: notification,
              defaultPrevented: false,
              eventPhase: 0,
              isTrusted: true,
              path: [],
              returnValue: true,
              srcElement: notification,
              target: notification,
              timeStamp: new Date().getTime(),
              type: 'click'
            }
            const args = [event]
            notification.onclick.apply(notification, args)
          }
        }
      } else if (data.type === 'wavebox-notification-closed') {
        const notificationIndex = openNotifications.findIndex((n) => n.__id__ === data.notificationId)
        if (notificationIndex !== -1) {
          openNotifications.splice(notificationIndex, 1)
        }
      } else if (data.type === 'wavebox-notification-permission-request-response') {
        domainPermission = data.permission
        if (permissionRequests.has(data.responseId)) {
          const resolver = permissionRequests.get(data.responseId)
          permissionRequests.delete(data.responseId)
          resolver(data.permission)
        }
      }
    }
  }, false)

  class Notification {
    /* **************************************************************************/
    // Class
    /* **************************************************************************/

    static get permission () {
      return domainPermission
    }

    static requestPermission () {
      return new Promise((resolve, reject) => {
        const responseId = `${new Date().getTime()}:${Math.random()}`
        permissionRequests.set(responseId, resolve)
        window.postMessage(JSON.stringify({
          wavebox: true,
          type: 'wavebox-notification-permission-request',
          responseId: responseId
        }), '*')
      })
    }

    /* **************************************************************************/
    // Lifecycle
    /* **************************************************************************/

    constructor (title, options = {}) {
      idAcc += 1
      this.__id__ = idAcc
      this.__title__ = title
      this.__options__ = Object.freeze(Object.assign({}, options))
      this.__created__ = new Date().getTime()
      this.__onclick__ = null
      this.__onerror__ = null

      window.postMessage(JSON.stringify({
        wavebox: true,
        type: 'wavebox-notification-present',
        notificationId: this.__id__,
        notification: {
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
    get body () { return this.__options__.body }
    get data () { return this.__options__.data }
    get dir () { return this.__options__.dir }
    get lang () { return this.__options__.lang }
    get tag () { return this.__options__.tag }
    get icon () { return this.__options__.icon }
    get image () { return this.__options__.image }
    get requireInteraction () { return this.__options__.requireInteraction }
    get silent () { return this.__options__.silent }
    get timestamp () { return this.__options__.timestamp === undefined ? this.__created__ : this.__options__.timestamp }
    get title () { return this.__options__.title }
    get vibrate () { return this.__options__.vibrate ? [1] : [0] }

    get onclick () { return this.__onclick__ }
    set onclick (v) { this.__onclick__ = v }
    get onerror () { return this.__onerror__ }
    set onerror (v) { this.__onerror__ = v }

    /* **************************************************************************/
    // Methods
    /* **************************************************************************/

    close () {
      window.postMessage(JSON.stringify({
        wavebox: true,
        type: 'browser-notification-close',
        notificationId: this.__id__
      }), '*')
    }
  }

  window.Notification = Notification
})()
