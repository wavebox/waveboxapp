import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import MailboxWebView from './MailboxWebView'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxInformationCover from './MailboxInformationCover'
import HotelIcon from '@material-ui/icons/Hotel'
import AlarmIcon from '@material-ui/icons/Alarm'

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

    this.mailboxWebviewRef = null
    this.queuedIPCSend = []

    // Expose the pass-through methods
    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function (...args) {
        if (self.mailboxWebviewRef) {
          return self.mailboxWebviewRef[m](...args)
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
      this.mailboxWebviewRef.send(...args)
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
      .then(() => this.mailboxWebviewRef.capturePagePromise())
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
          innerRef={(n) => { this.mailboxWebviewRef = n }}
          mailboxId={mailboxId}
          serviceType={serviceType}
          className={className}
          style={style}
          domReady={this.handleDomReady}
          {...passProps} />)
    } else {
      if (showSleepPlaceholder && isActive) {
        return (
          <MailboxInformationCover
            style={style}
            className={className}
            IconComponent={HotelIcon}
            title='Shhhh!'
            text={['This tab is currently sleeping']}
            button={(
              <Button variant='raised' onClick={() => mailboxActions.awakenService(mailboxId, serviceType)}>
                <AlarmIcon style={{ marginRight: 6 }} />
                Wake it up
              </Button>
            )} />
        )
      } else {
        return false
      }
    }
  }
}
