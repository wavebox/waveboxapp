import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { FullscreenModal, AuthenticationInstruction } from 'Components'

const styles = {
  modalBody: {
    borderRadius: 2,
    padding: 0,
    backgroundColor: 'rgb(242, 242, 242)'
  },
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    bottom: 16,
    right: 16
  }
}

export default class MailboxReauthenticatingScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <FullscreenModal modal open bodyStyle={styles.modalBody}>
        <AuthenticationInstruction style={styles.container} />
      </FullscreenModal>
    )
  }
}
