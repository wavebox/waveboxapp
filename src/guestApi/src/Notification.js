'use strict'
/* global WB_API_KEY */
/* global WB_CONFIG */

;(function () {
  const openNotifications = []
  const permissionRequests = new Map()
  let idAcc = 0
  let domainPermission = WB_CONFIG.permission

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

          const clickHandlers = notification.__eventHandlers__
            .filter((handler) => handler.type === 'click')
            .map((handler) => handler.listener)
            .concat(notification.onclick ? [notification.onclick] : [])

          if (clickHandlers.length) {
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
            clickHandlers.forEach((handler) => {
              if (typeof (handler) === 'function') {
                handler.apply(notification, args)
              } else if (typeof (handler) === 'object' && typeof (handler.handleEvent) === 'function') {
                handler.handleEvent.apply(notification, args)
              }
            })
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

    static get permission () { return domainPermission }

    /**
    * Make sure we also handle the old-style callback
    * @param depricatedCallback=undefined: callback to exectue. Depricated
    * @return promise
    */
    static requestPermission (depricatedCallback = undefined) {
      return new Promise((resolve, reject) => {
        const responseId = `${new Date().getTime()}:${Math.random()}`
        const responder = (nextPermission) => {
          if (typeof (depricatedCallback) === 'function') { depricatedCallback(nextPermission) }
          resolve(nextPermission)
        }

        permissionRequests.set(responseId, responder)
        window.top.postMessage(JSON.stringify({
          apiKey: WB_API_KEY,
          wavebox: true,
          type: 'wavebox-notification-permission-request',
          responseId: responseId
        }), '*')
      })
    }

    /* **************************************************************************/
    // Lifecycle
    /* **************************************************************************/

    /**
    * @param title: the notification title
    * @param options={}: options for the notification
    */
    constructor (title, options = {}) {
      idAcc += 1
      this.__id__ = idAcc
      this.__title__ = title
      this.__options__ = Object.freeze(Object.assign({}, options))
      this.__created__ = new Date().getTime()
      this.__eventHandlers__ = []
      this.__onclick__ = null
      this.__onerror__ = null

      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
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
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'browser-notification-close',
        notificationId: this.__id__
      }), '*')
    }

    /**
    * Adds an event listener
    * @param type: the listener type
    * @param listener: the listener callback or event handler
    * @param useCapture: ignored
    */
    addEventListener (type, listener, useCapture) {
      this.__eventHandlers__.push({ type: type, listener: listener })
    }

    /**
    * Removes an event listener
    * @param type: the listener type
    * @param listener: the listener callback or event handler
    */
    removeEventListener (type, listener) {
      this.__eventHandlers__ = this.__eventHandlers__.filter((r) => r.type !== type && r.listener !== listener)
    }
  }

  window.Notification = Notification
})()
