import React from 'react'
import { RaisedButton, Dialog, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { userStore, userActions } from 'stores/user'
import WaveboxHTTP from 'Server/WaveboxHTTP'
import { ipcRenderer, remote } from 'electron'
import { WB_QUIT_APP } from 'shared/ipcEvents'
import * as Colors from 'material-ui/styles/colors'
import Resolver from 'Runtime/Resolver'

const styles = {
  modal: {
    zIndex: 10000
  },
  body: {
    textAlign: 'center'
  },
  appIcon: {
    height: 100,
    width: 'auto',
    display: 'block',
    margin: '0px auto'
  },
  privacyLink: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: Colors.blue800,
    fontSize: '85%'
  },
  actions: {
    textAlign: 'center'
  },
  action: {
    marginLeft: 16,
    marginRight: 16
  },
  actionIcon: {
    fontSize: 16
  }
}

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
        privacyId: userState.user.privacyMessage.id,
        privacyUrl: userState.user.privacyMessage.url,
        privacyMessageText: userState.user.privacyMessage.message
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
          privacyId: userState.user.privacyMessage.id,
          privacyUrl: userState.user.privacyMessage.url,
          privacyMessageText: userState.user.privacyMessage.message
        } : {
          privacyId: undefined,
          privacyUrl: undefined,
          privacyMessageText: undefined
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

  /**
  * Handles opening the privacy url
  * @param evt: the event that fired
  */
  handleOpenPrivacy = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal(this.state.privacyUrl)
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
      privacyUrl,
      privacyMessageText
    } = this.state
    if (!shouldRender) { return null }

    const actions = (
      <div style={styles.actions}>
        <RaisedButton
          label='Reject'
          style={styles.action}
          disabled={agreeRequestActive}
          icon={(<FontIcon style={styles.actionIcon} className='far fa-fw fa-times-circle' />)}
          onClick={this.handleDisagree} />
        <RaisedButton
          primary
          label='Agree'
          style={styles.action}
          icon={agreeRequestActive ? (
            <FontIcon style={styles.actionIcon} className='far fa-fw fa-spin fa-spinner-third' />
          ) : (
            <FontIcon style={styles.actionIcon} className='far fa-fw fa-check-circle' />
          )}
          disabled={agreeRequestActive}
          onClick={this.handleAgree} />
      </div>
    )

    return (
      <Dialog
        modal
        style={styles.modal}
        bodyStyle={styles.body}
        open={hasPrivacyMessage}
        actions={actions}>
        <img src={Resolver.icon('app.svg')} style={styles.appIcon} />
        {hasPrivacyMessage ? (
          <div>
            <div>
              {privacyMessageText.split('\n').map((line, index) => (<p key={index}>{line}</p>))}
            </div>
            <p style={styles.privacyLink} onClick={this.handleOpenPrivacy}>{privacyUrl}</p>
          </div>
        ) : undefined}
      </Dialog>
    )
  }
}
