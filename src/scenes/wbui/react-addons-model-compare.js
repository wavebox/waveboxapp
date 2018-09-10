/**
* Does a comparison of two models
* @param prev: the previous model
* @param next: the next model
* @param keys: the keys to check within the model
* @return false if the two models & keys are the same, true otherwise
*/
const modelCompare = function (prev, next, keys) {
  if (prev === next) { return false }
  if (!prev || !next) { return true }

  const different = keys.find((k) => prev[k] !== next[k])
  if (different) {
    return true
  } else {
    return false
  }
}

export default modelCompare
