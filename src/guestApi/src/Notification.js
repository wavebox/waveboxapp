'use strict'
/* global WB_API_KEY */
/* global WB_CONFIG */

;(function () {
  const privId = Symbol('privId')
  const privTitle = Symbol('privTitle')
  const privOptions = Symbol('privOptions')
  const privCreated = Symbol('privCreated')
  const privEventHandlers = Symbol('privEventHandlers')
  const privOnClick = Symbol('privOnClick')
  const privOnError = Symbol('privOnError')

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
        const notificationIndex = openNotifications.findIndex((n) => n[privId] === data.notificationId)
        if (notificationIndex !== -1) {
          const notification = openNotifications[notificationIndex]
          openNotifications.splice(notificationIndex, 1)

          const clickHandlers = notification[privEventHandlers]
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

            clickHandlers.forEach((handler) => {
              if (typeof (handler) === 'function') {
                handler.apply(notification, [event])
              } else if (typeof (handler) === 'object' && typeof (handler.handleEvent) === 'function') {
                handler.handleEvent(event)
              }
            })
          }
        }
      } else if (data.type === 'wavebox-notification-closed') {
        const notificationIndex = openNotifications.findIndex((n) => n[privId] === data.notificationId)
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
      this[privId] = idAcc
      this[privTitle] = title
      this[privOptions] = Object.freeze({ ...options })
      this[privCreated] = new Date().getTime()
      this[privEventHandlers] = []
      this[privOnClick] = null
      this[privOnError] = null

      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'wavebox-notification-present',
        notificationId: this[privId],
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

    get actions () { return this[privOptions].actions }
    get badge () { return this[privOptions].badge }
    get body () { return this[privOptions].body }
    get data () { return this[privOptions].data }
    get dir () { return this[privOptions].dir }
    get lang () { return this[privOptions].lang }
    get tag () { return this[privOptions].tag }
    get icon () { return this[privOptions].icon }
    get image () { return this[privOptions].image }
    get requireInteraction () { return this[privOptions].requireInteraction }
    get silent () { return this[privOptions].silent }
    get timestamp () { return this[privOptions].timestamp === undefined ? this[privCreated] : this[privOptions].timestamp }
    get title () { return this[privTitle] }
    get vibrate () { return this[privOptions].vibrate ? [1] : [0] }

    get onclick () { return this[privOnClick] }
    set onclick (v) { this[privOnClick] = v }
    get onerror () { return this[privOnError] }
    set onerror (v) { this[privOnError] = v }

    /* **************************************************************************/
    // Methods
    /* **************************************************************************/

    close () {
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'browser-notification-close',
        notificationId: this[privId]
      }), '*')
    }

    /**
    * Adds an event listener
    * @param type: the listener type
    * @param listener: the listener callback or event handler
    * @param useCapture: ignored
    */
    addEventListener (type, listener, useCapture) {
      this[privEventHandlers].push({ type: type, listener: listener })
    }

    /**
    * Removes an event listener
    * @param type: the listener type
    * @param listener: the listener callback or event handler
    */
    removeEventListener (type, listener) {
      this[privEventHandlers] = this[privEventHandlers].filter((r) => r.type !== type && r.listener !== listener)
    }
  }

  window.Notification = Notification
})()
