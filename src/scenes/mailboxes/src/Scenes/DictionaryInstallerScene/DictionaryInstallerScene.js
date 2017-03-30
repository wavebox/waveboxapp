const React = require('react')
const { Dialog } = require('material-ui')
const dictionariesStore = require('stores/dictionaries/dictionariesStore')
const DictionaryInstallStepper = require('./DictionaryInstallStepper')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'DictionaryInstallerScene',
  propTypes: {
    params: React.PropTypes.object.isRequired
  },
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    dictionariesStore.listen(this.dictionariesChanged)
  },

  componentWillUnmount () {
    dictionariesStore.unlisten(this.dictionariesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const store = dictionariesStore.getState()
    return {
      installId: store.installId()
    }
  },

  dictionariesChanged (store) {
    this.setState({
      installId: store.installId()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { installId } = this.state
    return (
      <Dialog
        modal
        title='Install Dictionary'
        open>
        {installId ? (
          <DictionaryInstallStepper key={installId} />
        ) : undefined}
      </Dialog>
    )
  }
})
