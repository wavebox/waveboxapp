import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import CoreServiceWebView from './CoreServiceWebView'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceInformationCover from './ServiceInformationCover'
import HotelIcon from '@material-ui/icons/Hotel'
import AlarmIcon from '@material-ui/icons/Alarm'

export default class CoreServiceWebViewHibernator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...CoreServiceWebView.propTypes,
    showSleepPlaceholder: PropTypes.bool.isRequired
  }
  static defaultProps = {
    ...CoreServiceWebView.defaultProps,
    showSleepPlaceholder: true
  }
  static WEBVIEW_METHODS = CoreServiceWebView.WEBVIEW_METHODS
  static REACT_WEBVIEW_EVENTS = CoreServiceWebView.REACT_WEBVIEW_EVENTS

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
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
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
    const accountState = accountStore.getState()
    return {
      isSleeping: accountState.isServiceSleeping(props.serviceId),
      captureRef: null,
      isActive: accountState.isServiceActive(props.serviceId)
    }
  }

  accountUpdated = (accountState) => {
    const { serviceId } = this.props
    this.setState((prevState) => {
      const update = {
        isSleeping: accountState.isServiceSleeping(serviceId),
        isActive: accountState.isServiceActive(serviceId)
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
    const { serviceId } = this.props

    Promise.resolve()
      .then(() => this.mailboxWebviewRef.capturePagePromise())
      .then((nativeImage) => {
        accountActions.setServiceSnapshot(serviceId, nativeImage.toDataURL())
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
      serviceId,
      className,
      style,
      domReady,
      ...passProps
    } = this.props

    if (!isSleeping || captureRef !== null) {
      return (
        <CoreServiceWebView
          innerRef={(n) => { this.mailboxWebviewRef = n }}
          mailboxId={mailboxId}
          serviceId={serviceId}
          className={className}
          style={style}
          domReady={this.handleDomReady}
          {...passProps} />)
    } else {
      if (showSleepPlaceholder && isActive) {
        return (
          <ServiceInformationCover
            style={style}
            className={className}
            IconComponent={HotelIcon}
            title='Shhhh!'
            text={['This tab is currently sleeping']}
            button={(
              <Button variant='raised' onClick={() => accountActions.awakenService(serviceId)}>
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
