import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { userStore, userActions } from 'stores/user'
import WaveboxHTTP from 'Server/WaveboxHTTP'
import { ipcRenderer } from 'electron'
import { WB_QUIT_APP } from 'shared/ipcEvents'
import PrivacyMessageGDPRExisting1 from './PrivacyMessageGDPRExisting1'
import PrivacyMessageGDPRNew1 from './PrivacyMessageGDPRNew1'

export default class PrivacyDialog extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    this.renderTO = null
  }

  componentWillUnmount () {
    userStore.listen(this.userUpdated)
    clearTimeout(this.renderTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()

    const hasPrivacyMessage = userState.user.hasPrivacyMessage
    return {
      agreeRequestActive: false,
      hasPrivacyMessage: hasPrivacyMessage,
      shouldRender: hasPrivacyMessage,
      clientId: userState.clientId,
      clientToken: userState.clientToken,
      ...(hasPrivacyMessage ? {
        privacyId: userState.user.privacyMessage.id
      } : {})
    }
  })()

  userUpdated = (userState) => {
    this.setState((prevState) => {
      const update = {
        hasPrivacyMessage: userState.user.hasPrivacyMessage,
        clientId: userState.clientId,
        clientToken: userState.clientToken,
        ...(userState.user.hasPrivacyMessage ? {
          privacyId: userState.user.privacyMessage.id
        } : {
          privacyId: undefined
        })
      }
      if (prevState.hasPrivacyMessage !== update.hasPrivacyMessage) {
        if (update.hasPrivacyMessage) {
          update.shouldRender = true
        } else {
          clearTimeout(this.renderTO)
          this.renderTO = setTimeout(() => {
            this.setState({ shouldRender: false })
          }, 1000)
        }
      }
      return update
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Reports that the user has agreed privacy
  */
  handleAgree = () => {
    const { clientId, clientToken, privacyId } = this.state

    this.setState({ agreeRequestActive: true })
    Promise.resolve()
      .then(() => WaveboxHTTP.agreePrivacy(clientId, clientToken, privacyId))
      .then((user) => {
        userActions.setUser(user, new Date().getTime())
        this.setState({ agreeRequestActive: false })
      })
      .catch((e) => {
        this.setState({ agreeRequestActive: false })
      })
  }

  /**
  * Reports that the user has not agreed privacy
  */
  handleDisagree = () => {
    ipcRenderer.send(WB_QUIT_APP)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      hasPrivacyMessage,
      agreeRequestActive,
      shouldRender,
      privacyId
    } = this.state
    if (!shouldRender) { return null }

    if (privacyId === 'gdpr_new_1') {
      return (
        <PrivacyMessageGDPRNew1
          onAgree={this.handleAgree}
          onDisagree={this.handleDisagree}
          agreeRequestActive={agreeRequestActive}
          open={hasPrivacyMessage} />
      )
    } else if (privacyId === 'gdpr_existing_1') {
      return (
        <PrivacyMessageGDPRExisting1
          onAgree={this.handleAgree}
          onDisagree={this.handleDisagree}
          agreeRequestActive={agreeRequestActive}
          open={hasPrivacyMessage} />
      )
    } else {
      return null
    }
  }
}
