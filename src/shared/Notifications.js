const NOTIFICATION_PROVIDERS = Object.freeze({
  ELECTRON: 'ELECTRON',
  ENHANCED: 'ENHANCED'
})

const NOTIFICATION_SOUNDS_DARWIN = Object.freeze({
  'default': 'Basso (Default)',
  'Blow': 'Blow',
  'Bottle': 'Bottle',
  'Frog': 'Frog',
  'Funk': 'Funk',
  'Glass': 'Glass',
  'Hero': 'Hero',
  'Morse': 'Morse',
  'Ping': 'Ping',
  'Pop': 'Pop',
  'Purr': 'Purr',
  'Sosumi': 'Sosumi',
  'Submarine': 'Submarine',
  'Tink': 'Tink'
})
const DEFAULT_NOTIFICATION_SOUND_DARWIN = 'default'

const NOTIFICATION_SOUNDS_WIN32 = Object.freeze({
  'ms-winsoundevent:Notification.Default': 'Default',
  'ms-winsoundevent:Notification.IM': 'IM',
  'ms-winsoundevent:Notification.Mail': 'Mail',
  'ms-winsoundevent:Notification.Reminder': 'Reminder',
  'ms-winsoundevent:Notification.SMS': 'SMS'
})
const DEFAULT_NOTIFICATION_SOUND_WIN32 = 'ms-winsoundevent:Notification.Default'

module.exports = {
  NOTIFICATION_TEST_MAILBOX_ID: '__notificationtest__',

  NOTIFICATION_PROVIDERS: NOTIFICATION_PROVIDERS,
  DEFAULT_NOTIFICATION_PROVIDER: NOTIFICATION_PROVIDERS.ELECTRON,

  NOTIFICATION_SOUNDS_DARWIN: NOTIFICATION_SOUNDS_DARWIN,
  DEFAULT_NOTIFICATION_SOUND_DARWIN: DEFAULT_NOTIFICATION_SOUND_DARWIN,
  NOTIFICATION_SOUNDS_WIN32: NOTIFICATION_SOUNDS_WIN32,
  DEFAULT_NOTIFICATION_SOUND_WIN32: DEFAULT_NOTIFICATION_SOUND_WIN32,

  NOTIFICATION_SOUNDS: (() => {
    switch (process.platform) {
      case 'darwin': return NOTIFICATION_SOUNDS_DARWIN
      case 'win32': return NOTIFICATION_SOUNDS_WIN32
      case 'linux':
      default: return {}
    }
  })(),
  DEFAULT_NOTIFICATION_SOUND: (() => {
    switch (process.platform) {
      case 'darwin': return DEFAULT_NOTIFICATION_SOUND_DARWIN
      case 'win32': return DEFAULT_NOTIFICATION_SOUND_WIN32
      case 'linux':
      default: return undefined
    }
  })()
}
