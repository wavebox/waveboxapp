const seconds = function (seconds) {
  return 1000 * seconds
}
const minutes = function (minutes) {
  return 1000 * 60 * minutes
}
const hours = function (hours) {
  return 1000 * 60 * 60 * hours
}
const days = function (days) {
  return 1000 * 60 * 60 * 24 * days
}

module.exports = Object.freeze({
  // App
  APP_ID: 'wavebox.io',
  ANALYTICS_HEARTBEAT_INTERVAL: minutes(5),
  PRELOAD_USE_SYNC_FS: true, // Temporary fix for https://github.com/electron/electron/issues/9713
  RELEASE_CHANNELS: Object.assign({
    STABLE: 'STABLE',
    BETA: 'BETA'
  }),

  // Database
  PERSISTENCE_INDEX_KEY: '__index__',
  DB_WRITE_DELAY_MS: 500,
  DB_BACKUP_INTERVAL: minutes(15),
  DB_MAX_BACKUPS: 10,

  // Metrics
  METRICS_LOG_WRITE_INTERVAL: minutes(30),

  // Mailboxes
  MAILBOX_SLEEP_WAIT: minutes(5),
  MAILBOX_SLEEP_EXTEND: seconds(30),
  REFOCUS_MAILBOX_INTERVAL_MS: 300,
  SERVICE_LOCAL_AVATAR_PREFIX: 'SERVICE_LOCAL:',

  // Google
  GOOGLE_PROFILE_SYNC_INTERVAL: hours(6),
  GOOGLE_MAILBOX_WATCH_INTERVAL: days(6),

  // Trello
  TRELLO_PROFILE_SYNC_INTERVAL: hours(6),
  TRELLO_NOTIFICATION_SYNC_INTERVAL: seconds(30),

  // Slack
  SLACK_FULL_COUNT_SYNC_INTERVAL: minutes(5),
  SLACK_RECONNECT_SOCKET_INTERVAL: minutes(1),
  SLACK_RTM_RETRY_RECONNECT_MS: seconds(15),

  // Microsoft
  MICROSOFT_PROFILE_SYNC_INTERVAL: hours(6),
  MICROSOFT_UNREAD_SYNC_INTERVAL: seconds(60),

  // Sync
  SYNC_SOCKET_URL: 'wss://wavebox.io/socket',
  SYNC_SOCKET_UPGRADE_INTERVAL: minutes(5),
  SYNC_SOCKET_RECONNECT_MIN: 500,
  SYNC_SOCKET_RECONNECT_RANGE: seconds(4.5),

  // Dictionaries
  PREINSTALLED_DICTIONARIES: ['en_US'],

  // Notifications
  NOTIFICATION_MAX_AGE: minutes(10),
  NOTIFICATION_FIRST_RUN_GRACE_MS: seconds(30),
  DISALLOWED_HTML5_NOTIFICATION_HOSTS: [
    'mail.google.com',
    'inbox.google.com',
    'trello.com'
  ],
  ALLOWED_HTML5_NOTIFICATION_HOSTS: [
    '.slack.com',
    'calendar.google.com',
    'allo.google.com'
  ],

  // Extensions
  EXTENSION_AUTO_UPDATE_INTERVAL: hours(2),

  // Cookies
  ARTIFICIAL_COOKIE_PERSIST_WAIT: seconds(30),
  ARTIFICIAL_COOKIE_PERSIST_PERIOD: days(30),

  // Chrome
  CHROME_PROTOCOL: 'chrome',
  CHROME_PDF_URL: 'chrome://pdf-viewer/index.html',

  // News
  NEWS_URL: 'https://news.wavebox.io',
  NEWS_SYNC_PERIOD: hours(12),

  // URLs
  WEB_URL: 'https://wavebox.io',
  SUPPORT_URL: 'https://wavebox.io/support',
  BLOG_URL: 'https://blog.wavebox.io',
  KB_URL: 'https://wavebox.io/kb',
  GITHUB_URL: 'https://github.com/wavebox/waveboxapp/',
  GITHUB_ISSUE_URL: 'https://github.com/wavebox/waveboxapp/issues/',
  PRIVACY_URL: 'https://wavebox.io/privacy/',
  TERMS_URL: 'https://wavebox.io/terms/',
  EULA_URL: 'https://wavebox.io/eula/',
  USER_SCRIPTS_WEB_URL: 'https://github.com/Thomas101/wmail-user-scripts',
  QUICK_START_WEB_URL: 'https://wavebox.io/quick_start_guide',
  KB_BETA_CHANNEL_URL: 'https://wavebox.io/kb/beta-channel',

  // Update
  UPDATE_FEED_DARWIN: 'https://wavebox.io/squirrel/darwin/updates/latest/',
  UPDATE_FEED_WIN32_IA32: 'https://wavebox.io/squirrel/win32_ia32/updates/latest/',
  UPDATE_FEED_WIN32_X64: 'https://wavebox.io/squirrel/win32_x86_64/updates/latest/',
  UPDATE_FEED_MANUAL: 'https://wavebox.io/updates/latest/',
  UPDATE_CHECK_INTERVAL: hours(12),
  UPDATE_USER_MANUAL_DOWNLOAD_STABLE: 'https://wavebox.io/download',
  UPDATE_USER_MANUAL_DOWNLOAD_BETA: 'https://github.com/wavebox/waveboxapp/releases',

  WAVEBOX_CAPTURE_URL_HOSTNAME: 'wavebox.io',
  WAVEBOX_CAPTURE_URL_PREFIX: '/app/redirect/',
  WAVEBOX_CAPTURE_URLS: {
    SETTINGS: '/app/redirect/settings',
    SETTINGS_PRO: '/app/redirect/settings/pro',
    HOME: '/app/redirect/home',
    WAVEBOX_AUTH: '/app/redirect/waveboxauth',
    WAVEBOX_AUTH_PAYMENT: '/app/redirect/waveboxauth/payment',
    WAVEBOX_AUTH_AFFILIATE: '/app/redirect/waveboxauth/affiliate',
    WAVEBOX_PRO_BUY: '/app/redirect/pro/buy'
  }
})
