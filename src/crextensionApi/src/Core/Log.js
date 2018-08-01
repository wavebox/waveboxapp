// Some extensions like to overwrite console. Create a function copy
const lockedConsole = Object.freeze(Object.keys(console).reduce((acc, k) => {
  acc[k] = console[k]
  return acc
}, {}))

export default lockedConsole
