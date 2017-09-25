import uuid from 'uuid'
import StorageBucket from './StorageBucket'
import { CLIENT_ID, ANALYTICS_ID, CREATED_TIME } from 'shared/Models/DeviceKeys'

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

export default storageBucket
