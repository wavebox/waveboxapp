const uuid = require('uuid')
const StorageBucket = require('./StorageBucket')
const { CLIENT_ID, ANALYTICS_ID, CREATED_TIME } = require('../../shared/Models/DeviceKeys')
const storageBucket = new StorageBucket('user')

if (storageBucket.getItem(CLIENT_ID) === undefined) {
  storageBucket._setItem(CLIENT_ID, JSON.stringify(uuid.v4()))
}
if (storageBucket.getItem(ANALYTICS_ID) === undefined) {
  storageBucket._setItem(ANALYTICS_ID, JSON.stringify(uuid.v4()))
}
if (storageBucket.getItem(CREATED_TIME) === undefined) {
  storageBucket._setItem(CREATED_TIME, JSON.stringify(new Date().getTime()))
}

module.exports = storageBucket
