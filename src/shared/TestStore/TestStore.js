import {ipcRenderer} from 'electron'

class Complex {
  get foo () { return 'bar' }

  foz () { return 'baz' }
}

class TestStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (...args) {
    console.log("ARGS",args)
    this.items = new Map()

    this.getItem = (id) => this.items.get(id)
    this.complex = new Complex()

    const actions = this.alt.getActions('TestActions')
    this.bindListeners({
      handleSetItem: actions.SET_ITEM,
      //handleDispatchOnMain: actions.DISPATCH_ON_MAIN
    })
    this.bindListeners({
      handleDispatchOnMain: actions.DISPATCH_ON_MAIN,
      handleA: actions.A_ACTION,
      handleB: actions.B_ACTION
    })
  }

  handleA (a) {
    console.log("A",a)
  }
  handleB (a) {
    console.log("B",a)
  }

  handleSetItem ({id, item}) {
    this.items.set(id, item)

  }

  handleDispatchOnMain ({name, args}) {
    this.preventDefault()
    ipcRenderer.send(name, args)
  }
}

class TestStoreOR extends TestStore {
  handleSetItem (...p) {
    console.log("INCHILD")
    super.handleSetItem(...p)
  }
}

export default TestStoreOR
