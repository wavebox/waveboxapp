import React from 'react'
import PropTypes from 'prop-types'
import CoreServiceWebView from './CoreServiceWebView'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceSleepingCover from './ServiceSleepingCover'
import uuid from 'uuid'
import ConcurrencyLock from './ConcurrencyLock'

let concurrencyLock
class CoreServiceWebViewHibernator extends React.Component {
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

    // Late build this as it needs stores setup
    if (!concurrencyLock) {
      concurrencyLock = new ConcurrencyLock()
    }

    this.mailboxWebviewRef = null
    this.queuedIPCSend = []
    this.instanceId = uuid.v4()
    this.state = this.generateInitialState(props.serviceId)

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
    concurrencyLock.destroyLoadLock(this.instanceId)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.generateInitialState(nextProps.serviceId)
      )
    }
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  accountUpdated = (accountState) => {
    const { serviceId } = this.props
    this.setStateWithChangeHandlers({
      isSleeping: accountState.isServiceSleeping(serviceId),
      isActive: accountState.isServiceActive(serviceId)
    })
  }

  loadLockAquired = () => {
    this.setState({ hasLoadLock: true })
  }

  /**
  * Generates the initial state for a service
  * @param serviceId: the id of the service
  * @return a new state
  */
  generateInitialState (serviceId) {
    // Tear-down any previous state
    concurrencyLock.destroyLoadLock(this.instanceId)

    const accountState = accountStore.getState()
    const isSleeping = accountState.isServiceSleeping(serviceId)
    const isActive = accountState.isServiceActive(serviceId)
    return {
      isSleeping: isSleeping,
      isActive: isActive,
      captureRef: null,
      hasLoadLock: !isSleeping && isActive
        ? concurrencyLock.forceLoadLock(this.instanceId)
        : !isSleeping
          ? concurrencyLock.requestLoadLock(this.instanceId, this.loadLockAquired)
          : false
    }
  }

  /**
  * Sets the state by also atomically checking the changes and applying a second set of
  * auto changesets (e.g captures)
  * @param changeset: the changeset to apply
  */
  setStateWithChangeHandlers (changeset) {
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
        ...changeset
      }

      // Run the capture code on change
      if (prevState.isSleeping !== nextState.isSleeping && nextState.isSleeping) {
        if (prevState.hasLoadLock) {
          // If we don't have the load lock, then we wont be running. Without protection
          // we're effectively going to wake up to take a picture. bad
          nextState.captureRef = Math.random()
          this.captureSnapshot(nextState.captureRef)
        }
      }

      // Auto aquire or free the load lock
      if (prevState.hasLoadLock) {
        if (!prevState.isSleeping && nextState.isSleeping) {
          // Move from awake to asleep
          concurrencyLock.destroyLoadLock(this.instanceId)
          nextState.hasLoadLock = false
        }
      } else {
        const transitioningToAwake =
          (prevState.isSleeping && !nextState.isSleeping) || // Move from sleeping to awake
          (!nextState.isSleeping && !prevState.isActive && nextState.isActive) // Move from already awake from inactive to active

        if (transitioningToAwake) {
          nextState.hasLoadLock = nextState.isActive
            ? concurrencyLock.forceLoadLock(this.instanceId)
            : concurrencyLock.requestLoadLock(this.instanceId, this.loadLockAquired)
        }
      }

      return nextState
    })
  }

  /* **************************************************************************/
  // Webview events
  /* **************************************************************************/

  /**
  * Handles the DOM becoming ready by pushing the queued ipc events down the pipe
  * @param evt: the event that fired
  */
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

  /**
  * Handles the webview finishing loading
  * @param evt: the event that fired
  */
  handleDidStopLoading = (evt) => {
    concurrencyLock.loadLockLoaded(this.instanceId)

    // Call parent
    if (this.props.didStopLoading) {
      this.props.didStopLoading(evt)
    }
  }

  /**
  * Handles the webview crashing
  * @param evt: the event that fired
  */
  handleCrashed = (evt) => {
    concurrencyLock.loadLockLoaded(this.instanceId)

    // Call parent
    if (this.props.crashed) {
      this.props.crashed(evt)
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
  // Capturing
  /* **************************************************************************/

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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      isSleeping,
      captureRef,
      isActive,
      hasLoadLock
    } = this.state
    const {
      showSleepPlaceholder,
      mailboxId,
      serviceId,
      className,
      style,
      domReady,
      didStopLoading,
      crashed,
      ...passProps
    } = this.props

    if ((!isSleeping && hasLoadLock) || captureRef !== null) {
      return (
        <CoreServiceWebView
          innerRef={(n) => { this.mailboxWebviewRef = n }}
          mailboxId={mailboxId}
          serviceId={serviceId}
          className={className}
          style={style}
          domReady={this.handleDomReady}
          didStopLoading={this.handleDidStopLoading}
          crashed={this.handleCrashed}
          {...passProps} />)
    } else {
      if (showSleepPlaceholder && isActive) {
        return (
          <ServiceSleepingCover
            style={style}
            className={className}
            onAwakenService={() => accountActions.awakenService(serviceId)} />
        )
      } else {
        return false
      }
    }
  }
}

export default CoreServiceWebViewHibernator
