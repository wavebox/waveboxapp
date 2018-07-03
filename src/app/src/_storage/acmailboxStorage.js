import StorageBucket from './StorageBucket'

console.log('acmailboxStorage.js')
try {
throw new Error()
} catch (ex) {
  console.log(ex.stack)
}

export default new StorageBucket('acmailbox')
