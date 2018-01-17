class TestActions {
  constructor () {
    this.test = 'tom'
  }

  dispatchOnMain (name, args) {
    return { name, args }
  }

  setItem (id, item) {
    console.log(this.test)
    return {id,item}
    if (process.type === 'browser') {
      return {id,item}
    } else if (process.type === 'renderer') {
      return this.dispatchOnMain('SET_ITEM', {id,item})
    }
  }
}

export default TestActions
