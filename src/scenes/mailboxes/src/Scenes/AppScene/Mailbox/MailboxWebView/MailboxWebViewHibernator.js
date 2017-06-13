import React from 'react'
import MailboxWebView from './MailboxWebView'
import { mailboxStore, mailboxActions } from 'stores/mailbox'

const REF = 'MailboxWebView'

export default class MailboxWebViewHibernator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...MailboxWebView.propTypes
  }
  static defaultProps = {
    ...MailboxWebView.defaultProps
  }
  static WEBVIEW_METHODS = MailboxWebView.WEBVIEW_METHODS
  static REACT_WEBVIEW_EVENTS = MailboxWebView.REACT_WEBVIEW_EVENTS

  /* **************************************************************************/
  // Class Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    // Expose the pass-through methods
    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function () {
        if (self.refs[REF]) {
          return self.refs[REF][m].apply(self.refs[REF], Array.from(arguments))
        } else {
          throw new Error(`MailboxWebViewHibernator has slept MailboxWebView. Cannot call ${m}`)
        }
      }
    })
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    this.captureRef = 0
    mailboxStore.listen(this.mailboxUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
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
    return {
      isSleeping: mailboxState.isSleeping(props.mailboxId, props.serviceType),
      isCapturing: false
    }
  }

  mailboxUpdated = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    this.setState((prevState) => {
      const isSleeping = mailboxState.isSleeping(mailboxId, serviceType)
      if (prevState.isSleeping !== isSleeping) {
        if (isSleeping) {
          this.captureSnapshot()
          return { isSleeping: true, isCapturing: true }
        } else {
          return { isSleeping: false, isCapturing: false }
        }
      } else {
        return undefined
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Captures a snapshot of the webview and pushes it to sleep on completion
  */
  captureSnapshot () {
    const { mailboxId, serviceType } = this.props
    const captureRef = Math.random()
    this.captureRef = captureRef

    Promise.resolve()
      .then(() => {
        return new Promise((resolve) => {
          this.refs[REF].capturePage((nativeImage) => resolve(nativeImage))
        })
      })
      .then((nativeImage) => {
        mailboxActions.setServiceSnapshot(mailboxId, serviceType, nativeImage.toDataURL())
        return Promise.resolve()
      })
      .catch((e) => Promise.resolve())
      .then(() => {
        if (this.captureRef !== captureRef) { return } // Check nobody else has sneaked in before completion
        this.setState({ isCapturing: false })
      })
  }

  render () {
    const { isSleeping, isCapturing } = this.state

    if (!isSleeping || isCapturing) {
      return (<MailboxWebView ref={REF} {...this.props} />)
    } else {
      return false
    }
  }
}
