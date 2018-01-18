class TestActions {

  constructor () {
    this.test = 'tom'

    this.testFn=() => {
      console.log('a')
    }
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

  aAction () {
    return Promise.resolve()
    return { a:'true'}
  }

  bAction () {
    this.aAction()
    return Promise.resolve()
  }
}

export default TestActions
