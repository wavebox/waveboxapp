'use strict'
/* global WB_API_KEY */
/* global WB_CONFIG */

;(function () {
  window.wavebox = {}
  window.wavebox.badge = {}
  window.wavebox.tray = {}
  window.wavebox.api = {}

  const apiCall = function (name, args) {
    window.top.postMessage(JSON.stringify({
      apiKey: WB_API_KEY,
      wavebox: true,
      type: 'wavebox-api',
      untrusted: true,
      name: name,
      args: args
    }), '*')
  }

  window.wavebox.badge.setCount = function (count) {
    apiCall('badge:setCount', Array.from(arguments))
  }

  window.wavebox.badge.setHasUnreadActivity = function (hasActivity) {
    apiCall('badge:setHasUnreadActivity', Array.from(arguments))
  }

  window.wavebox.tray.setMessages = function (messages) {
    apiCall('tray:setMessages', Array.from(arguments))
  }

  window.wavebox.api.version = '0.0.2-alpha'
  window.wavebox.api.appVersion = WB_CONFIG.appVersion
})()
