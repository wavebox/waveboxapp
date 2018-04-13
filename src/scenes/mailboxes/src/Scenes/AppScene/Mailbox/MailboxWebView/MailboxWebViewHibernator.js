import './MailboxWebView.less'
import React from 'react'
import PropTypes from 'prop-types'
import { FontIcon, RaisedButton } from 'material-ui'
import MailboxWebView from './MailboxWebView'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import classnames from 'classnames'

const REF = 'MailboxWebView'

export default class MailboxWebViewHibernator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...MailboxWebView.propTypes,
    showSleepPlaceholder: PropTypes.bool.isRequired
  }
  static defaultProps = {
    ...MailboxWebView.defaultProps,
    showSleepPlaceholder: true
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
      captureRef: null,
      isActive: mailboxState.isActive(props.mailboxId, props.serviceType)
    }
  }

  mailboxUpdated = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    this.setState((prevState) => {
      const update = {
        isSleeping: mailboxState.isSleeping(mailboxId, serviceType),
        isActive: mailboxState.isActive(mailboxId, serviceType)
      }

      if (prevState.isSleeping !== update.isSleeping && update.isSleeping) {
        update.captureRef = Math.random()
        this.captureSnapshot(update.captureRef)
      }

      return update
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
  * @param captureRef: the capture ref to check it's us who kicked off the capture
  */
  captureSnapshot (captureRef) {
    const { mailboxId, serviceType } = this.props

    Promise.resolve()
      .then(() => this.refs[REF].capturePagePromise())
      .then((nativeImage) => {
        mailboxActions.setServiceSnapshot(mailboxId, serviceType, nativeImage.toDataURL())
        return Promise.resolve()
      })
      .catch((e) => Promise.resolve())
      .then(() => {
        this.setState((prevState) => {
          if (prevState.captureRef === captureRef) {
            return { captureRef: null }
          } else {
            return undefined
          }
        })
      })
  }

  render () {
    const { isSleeping, captureRef, isActive } = this.state
    const {
      showSleepPlaceholder,
      mailboxId,
      serviceType,
      className,
      style,
      domReady,
      ...passProps
    } = this.props

    if (!isSleeping || captureRef !== null) {
      return (
        <MailboxWebView
          ref={REF}
          mailboxId={mailboxId}
          serviceType={serviceType}
          className={className}
          style={style}
          domReady={this.handleDomReady}
          {...passProps} />)
    } else {
      if (showSleepPlaceholder) {
        const fullClassname = classnames(
          'ReactComponent-MailboxWebView sleeping',
          isActive ? 'active' : undefined,
          className
        )
        return (
          <div className={fullClassname} style={style}>
            <div className='ReactComponent-MailboxSleeping'>
              <FontIcon className='material-icons primary-icon'>hotel</FontIcon>
              <h1>Shhhh!</h1>
              <p>This tab is currently sleeping</p>
              <br />
              <RaisedButton
                label='Wake it up'
                icon={<FontIcon className='material-icons'>alarm</FontIcon>}
                onClick={() => {
                  mailboxActions.awakenService(mailboxId, serviceType)
                }} />
            </div>
          </div>
        )
      } else {
        return false
      }
    }
  }
}
