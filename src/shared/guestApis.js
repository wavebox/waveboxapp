const WAVEBOX_GUEST_APIS = {
  NOTIFICATION: 'Notification.js',
  CHROME: 'Chrome.js',
  CONTENT_WINDOW: 'ContentWindow.js',

  GMAIL_WINDOW_OPEN: 'GmailWindowOpen.js',
  ONEDRIVE_WINDOW_OPEN: 'OnedriveWindowOpen.js'
}

module.exports = {
  WAVEBOX_GUEST_APIS_PROTOCOL: 'wavebox',
  VALID_WAVEBOX_GUEST_APIS: new Set(Object.keys(WAVEBOX_GUEST_APIS).map((k) => WAVEBOX_GUEST_APIS[k])),
  WAVEBOX_GUEST_APIS
}
