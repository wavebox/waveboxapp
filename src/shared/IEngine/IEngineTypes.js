const MANIFEST = {
  'gmail': [
    'GOOGLE_MAIL'
  ],
  'trello': [
    'TRELLO'
  ]
}

const IENGINE_TYPES = new Set(Object.keys(MANIFEST))
const IENGINE_ALIAS_TO_TYPE = Object.keys(MANIFEST).reduce((acc, k) => {
  MANIFEST[k].forEach((alias) => {
    acc[alias] = k
  })
  return acc
}, {})
const IENGINE_ALIASES = new Set(Object.keys(IENGINE_ALIAS_TO_TYPE))

export {
  IENGINE_TYPES,
  IENGINE_ALIASES,
  IENGINE_ALIAS_TO_TYPE
}
