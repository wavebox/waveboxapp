const camelCase = function (name) {
  return name.split('-').map((token, index) => {
    return index === 0 ? token : (token.charAt(0).toUpperCase() + token.slice(1))
  }).join('')
}

export default camelCase
