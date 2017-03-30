// Try to keep these generic to support n-types of account
module.exports = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  DEFAULT: 'DEFAULT',
  STORAGE: 'STORAGE', // e.g. google drive
  CONTACTS: 'CONTACTS', // e.g. google contacts
  NOTES: 'NOTES', // e.g. google keep
  CALENDAR: 'CALENDAR', // e.g. google calendar
  PHOTOS: 'PHOTOS', // e.g. google photos
  COMMUNICATION: 'COMMUNICATION' // e.g. google hangouts
})
