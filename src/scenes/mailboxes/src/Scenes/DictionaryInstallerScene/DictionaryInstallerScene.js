import PropTypes from 'prop-types'
import React from 'react'
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import dictionariesStore from 'stores/dictionaries/dictionariesStore'
import DictionaryInstallStepper from './DictionaryInstallStepper'

export default class DictionaryInstallerScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    dictionariesStore.listen(this.dictionariesChanged)
  }

  componentWillUnmount () {
    dictionariesStore.unlisten(this.dictionariesChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const store = dictionariesStore.getState()
    return {
      installId: store.installId()
    }
  })()

  dictionariesChanged = (store) => {
    this.setState({
      installId: store.installId()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { installId } = this.state
    return (
      <Dialog
        disableEnforceFocus
        disableBackdropClick
        disableEscapeKeyDown
        open>
        <DialogTitle>Install Dictionary</DialogTitle>
        <DialogContent>
          {installId ? (
            <DictionaryInstallStepper key={installId} />
          ) : undefined}
        </DialogContent>
      </Dialog>
    )
  }
}
