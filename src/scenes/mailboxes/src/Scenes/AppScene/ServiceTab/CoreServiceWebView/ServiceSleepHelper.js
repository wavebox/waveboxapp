import PropTypes from 'prop-types'
import React from 'react'
import { Paper } from '@material-ui/core'
import { accountStore, accountActions } from 'stores/account'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import shallowCompare from 'react-addons-shallow-compare'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import HotelIcon from '@material-ui/icons/Hotel'
import lightBlue from '@material-ui/core/colors/lightBlue'
import blue from '@material-ui/core/colors/blue'
import grey from '@material-ui/core/colors/grey'
import Timeago from 'react-timeago'

const styles = {
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  loaderSleepPanel: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 24,
    fontSize: '75%',
    padding: '8px 16px',
    color: grey[600],
    borderRadius: 20
  },
  loaderSleepIcon: {
    display: 'block',
    width: 30,
    height: 30,
    marginRight: 10
  },
  loaderSleepLink: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[800]
  },
  loaderSleepSaving: {
    fontWeight: 'bold'
  }
}

@withStyles(styles)
class ServiceSleepHelper extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.deriveServiceState(nextProps.serviceId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveServiceState(this.props.serviceId, accountStore.getState())
    }
  })()

  /**
  * Derives the service state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  */
  deriveServiceState (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      sleepable: service.sleepable,
      metrics: accountState.getSleepingMetrics(serviceId)
    } : {
      sleepable: false,
      metrics: undefined
    }
  }

  accountChanged = (accountState) => {
    this.setState(this.deriveServiceState(this.props.serviceId, accountState))
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the disable sleep button being clicked
  * @param evt: the event that fired
  */
  handleDisableSleep = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    accountActions.reduceService(
      this.props.serviceId,
      ServiceReducer.setSleepable,
      false
    )
  }

  /**
  * Handles the helper being clicked and hides it
  * @param evt: the event that fired
  */
  handleHide = (evt) => {
    const { onRequestClose, onClick } = this.props
    if (onRequestClose) { onRequestClose() }
    if (onClick) { onClick(evt) }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderSavingText (memSaving, timeValue, timeUnit) {
    return `This tab was slept ${timeValue} ${timeUnit}${timeValue !== 1 ? 's' : ''} ago saving ${Math.round((memSaving || 0) / 1024 / 1024)}MB of memory`
  }

  render () {
    const {
      serviceId,
      onRequestClose,
      onClick,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      sleepable,
      metrics
    } = this.state

    return (
      <div
        className={classNames(className, classes.loader)}
        onClick={this.handleHide}
        {...passProps}>
        <Spinner size={50} color={lightBlue[600]} speed={0.75} />
        {sleepable ? (
          <Paper className={classes.loaderSleepPanel}>
            <HotelIcon className={classes.loaderSleepIcon} />
            <div>
              {metrics ? (
                <div className={classes.loaderSleepSaving}>
                  <Timeago
                    date={metrics.timestamp}
                    formatter={(value, unit, suffix) => this.renderSavingText(metrics.memory.bytes, value, unit)} />
                </div>
              ) : undefined}
              <div>
                {metrics ? `Use it often?` : `Use this tab often?`}
                &nbsp;
                <span className={classes.loaderSleepLink} onClick={this.handleDisableSleep}>Disable sleep</span>
                &nbsp;
                to keep it awake and avoid waiting...
              </div>
            </div>
          </Paper>
        ) : undefined}
      </div>
    )
  }
}

export default ServiceSleepHelper
