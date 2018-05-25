import shallowCompare from 'react-addons-shallow-compare'

/**
* Does a partial shallow compare
* @param prevProps: the next props
* @param prevState: the next state
* @param nextProps: the previous props
* @param nextState: the next props
* @return true if there is a change, false otherwise
*/
const partialShallowCompare = function (prevProps, prevState, nextProps, nextState) {
  return shallowCompare({
    props: nextProps,
    state: nextState
  }, prevProps, prevState)
}

export default partialShallowCompare
