import React from 'react'
import MailboxWebView from './MailboxWebView'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'

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

    this.queuedIPCSend = []

    // Expose the pass-through methods
    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function (...args) {
        if (self.refs[REF]) {
          return self.refs[REF][m](...args)
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
  // Webview events
  /* **************************************************************************/

  handleDomReady = (evt) => {
    // Send delayed ipc
    if (this.queuedIPCSend.length) {
      const queued = this.queuedIPCSend
      this.queuedIPCSend = []
      queued.forEach((req) => {
        this.send(...req)
      })
    }

    // Call parent
    if (this.props.domReady) {
      this.props.domReady(evt)
    }
  }

  /* **************************************************************************/
  // Pass-throughs
  /* **************************************************************************/

  /**
  * Sends a message over IPC, however if the webview is sleeping queues
  * it up until domready is fired
  * @param {...args} the arguments to pass
  * @return true if sent immediately, false otherwise
  */
  sendOrQueueIfSleeping (...args) {
    if (this.state.isSleeping) {
      this.queuedIPCSend.push(args)
      return false
    } else {
      this.refs[REF].send(...args)
      return true
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

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
    const { domReady, ...passProps } = this.props

    if (!isSleeping || isCapturing) {
      return (
        <MailboxWebView
          ref={REF}
          domReady={this.handleDomReady}
          {...passProps} />)
    } else {
      return false
    }
  }
}
