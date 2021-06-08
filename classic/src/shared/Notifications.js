const NOTIFICATION_PROVIDERS = Object.freeze({
  ELECTRON: 'ELECTRON',
  ENHANCED: 'ENHANCED'
})

const NOTIFICATION_SOUNDS_DARWIN = Object.freeze({
  'default': 'Basso',
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

const NOTIFICATION_SOUNDS_LINUX = Object.freeze({
  'beep.m4a': 'Beep',
  'blip.m4a': 'Blip',
  'buzzer.m4a': 'Buzzer',
  'chimes.m4a': 'Chimes',
  'click.m4a': 'Click',
  'correct.m4a': 'Correct',
  'ding.m4a': 'Ding',
  'falling.m4a': 'Falling',
  'marimba.m4a': 'Marimba',
  'pop.m4a': 'Pop',
  'squeak.m4a': 'Squeak',
  'toot.m4a': 'Toot',
  'xylophone.m4a': 'Xylophone'
})
const DEFAULT_NOTIFICATION_SOUND_LINUX = 'pop.m4a'

module.exports = {
  NOTIFICATION_PROVIDERS: NOTIFICATION_PROVIDERS,
  DEFAULT_NOTIFICATION_PROVIDER: NOTIFICATION_PROVIDERS.ELECTRON,

  NOTIFICATION_SOUNDS_DARWIN: NOTIFICATION_SOUNDS_DARWIN,
  DEFAULT_NOTIFICATION_SOUND_DARWIN: DEFAULT_NOTIFICATION_SOUND_DARWIN,
  NOTIFICATION_SOUNDS_WIN32: NOTIFICATION_SOUNDS_WIN32,
  DEFAULT_NOTIFICATION_SOUND_WIN32: DEFAULT_NOTIFICATION_SOUND_WIN32,
  NOTIFICATION_SOUNDS_LINUX: NOTIFICATION_SOUNDS_LINUX,
  DEFAULT_NOTIFICATION_SOUND_LINUX: DEFAULT_NOTIFICATION_SOUND_LINUX,

  NOTIFICATION_SOUNDS: (() => {
    switch (process.platform) {
      case 'darwin': return NOTIFICATION_SOUNDS_DARWIN
      case 'win32': return NOTIFICATION_SOUNDS_WIN32
      case 'linux': return NOTIFICATION_SOUNDS_LINUX
      default: return {}
    }
  })(),
  DEFAULT_NOTIFICATION_SOUND: (() => {
    switch (process.platform) {
      case 'darwin': return DEFAULT_NOTIFICATION_SOUND_DARWIN
      case 'win32': return DEFAULT_NOTIFICATION_SOUND_WIN32
      case 'linux': return DEFAULT_NOTIFICATION_SOUND_LINUX
      default: return undefined
    }
  })()
}
