import React from 'react'
import MailboxWebView from './MailboxWebView'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { userStore } from 'stores/user'

const REF = 'MailboxWebView'

export default class MailboxWebViewHibernator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...MailboxWebView.propTypes
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    this.sleepWait = null

    mailboxStore.listen(this.mailboxUpdated)
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    clearTimeout(this.sleepWait)

    mailboxStore.unlisten(this.mailboxUpdated)
    userStore.unlisten(this.userUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
      clearTimeout(this.sleepWait)
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const mailboxState = mailboxStore.getState()
    const isActive = mailboxState.isActive(props.mailboxId, props.serviceType)
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const service = mailbox.serviceForType(props.serviceType)
    return {
      isActive: isActive,
      isSleeping: !isActive,
      allowsSleeping: service ? service.sleepable : true,
      userHasSleepable: userStore.getState().user.hasSleepable
    }
  }

  mailboxUpdated = (mailboxState) => {
    this.setState((prevState) => {
      const mailbox = mailboxState.getMailbox(this.props.mailboxId)
      const service = mailbox ? mailbox.serviceForType(this.props.serviceType) : undefined
      if (!mailbox || !service) { return undefined }

      const update = {
        isActive: mailboxState.isActive(this.props.mailboxId, this.props.serviceType),
        allowsSleeping: service ? service.sleepable : true
      }
      if (prevState.isActive !== update.isActive) {
        clearTimeout(this.sleepWait)
        if (prevState.isActive && !update.isActive) {
          this.sleepWait = setTimeout(() => {
            this.sleepMailbox()
          }, service.sleepableTimeout)
        } else {
          update.isSleeping = false
        }
      }
      return update
    })
  }

  userUpdated = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /**
  * Puts the mailbox to sleep. If the mailbox is active this method
  * will return silently
  */
  sleepMailbox = () => {
    const isActive = mailboxStore.getState().isActive(this.props.mailboxId, this.props.serviceType)
    if (isActive) { return }

    if (this.refs[REF]) {
      Promise.resolve()
        .then(() => this.refs[REF].captureSnapshot())
        .then((nativeImage) => {
          mailboxActions.setServiceSnapshot(this.props.mailboxId, this.props.serviceType, nativeImage.toDataURL())
          return Promise.resolve()
        })
        .catch((e) => Promise.resolve())
        .then(() => {
          const isActive = mailboxStore.getState().isActive(this.props.mailboxId, this.props.serviceType)
          if (!isActive) {
            this.setState({ isSleeping: true })
          }
        })
    } else {
      this.setState({ isSleeping: true })
    }
  }

  /* **************************************************************************/
  // Webview pass throughs
  /* **************************************************************************/

  send = (name, obj) => {
    if (this.refs[REF]) {
      return this.refs[REF].send(name, obj)
    } else {
      throw new Error('MailboxTab is sleeping')
    }
  }
  sendWithResponse = (sendName, obj, timeout) => {
    if (this.refs[REF]) {
      return this.refs[REF].sendWithResponse(sendName, obj, timeout)
    } else {
      throw new Error('MailboxTab is sleeping')
    }
  }
  loadURL = (url) => {
    if (this.refs[REF]) {
      return this.refs[REF].loadURL(url)
    } else {
      clearTimeout(this.sleepWait)
      this.setState({ isSleeping: false }, () => {
        this.refs[REF].loadURL(url)
      })
      return undefined
    }
  }

  /**
  * Gets the underlying dom webview node
  * @throws error if sleeping
  * @return the webview node
  */
  getWebviewNode = () => {
    if (this.refs[REF]) {
      return this.refs[REF].getWebviewNode()
    } else {
      throw new Error('MailboxTab is sleeping')
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { allowsSleeping, isSleeping, userHasSleepable } = this.state

    if (allowsSleeping && userHasSleepable && isSleeping) {
      return false
    } else {
      return (<MailboxWebView ref={REF} {...this.props} />)
    }
  }
}
