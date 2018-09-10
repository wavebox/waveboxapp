import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions, accountDispatch } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import shallowCompare from 'react-addons-shallow-compare'
import TuneIcon from '@material-ui/icons/Tune'
import { USER_SCRIPTS_WEB_URL } from 'shared/constants'
import electron from 'electron'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import SettingsListItem from 'wbui/SettingsListItem'
import CodeIcon from '@material-ui/icons/Code'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import { Button } from '@material-ui/core'
import InboxIcon from '@material-ui/icons/Inbox'

const styles = {
  userscriptLink: {
    color: blue[700],
    fontSize: '75%'
  },
  buttonIcon: {
    marginRight: 6,
    width: 18,
    height: 18
  },
  buttonSpacer: {
    width: 16,
    height: 1,
    display: 'inline-block'
  },
  sandboxIcon: {
    fontSize: '18px',
    verticalAlign: 'text-top'
  }
}

@withStyles(styles)
class ServiceAdvancedSection extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
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
      this.setState(
        this.extractStateForService(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      sandboxFromMailbox: service.sandboxFromMailbox,
      customCSS: service.customCSS,
      customJS: service.customJS
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      classes,
      onRequestEditCustomCode,
      ...passProps
    } = this.props
    const {
      hasService,
      sandboxFromMailbox,
      customJS,
      customCSS
    } = this.state
    if (!hasService) { return false }

    return (
      <SettingsListSection title='Advanced' icon={<TuneIcon />} {...passProps}>
        <SettingsListItem>
          <div>
            <div>
              <Button
                size='small'
                variant='raised'
                onClick={() => {
                  onRequestEditCustomCode('Custom CSS', customCSS, (code) => {
                    accountActions.reduceService(serviceId, ServiceReducer.setCustomCSS, code)
                    accountDispatch.reloadService(serviceId)
                  })
                }}>
                <CodeIcon className={classes.buttonIcon} />
                Custom CSS
              </Button>
              <span className={classes.buttonSpacer} />
              <Button
                size='small'
                variant='raised'
                onClick={() => {
                  onRequestEditCustomCode('Custom JS', customJS, (code) => {
                    accountActions.reduceService(serviceId, ServiceReducer.setCustomJS, code)
                    accountDispatch.reloadService(serviceId)
                  })
                }}>
                <CodeIcon className={classes.buttonIcon} />
                Custom JS
              </Button>
            </div>
            <a
              className={classes.userscriptLink}
              onClick={(evt) => { evt.preventDefault(); electron.remote.shell.openExternal(USER_SCRIPTS_WEB_URL) }}
              href={USER_SCRIPTS_WEB_URL}>Find custom userscripts</a>
          </div>
        </SettingsListItem>
        <SettingsListItemSwitch
          divider={false}
          label={(
            <span>
              <InboxIcon className={classes.sandboxIcon} /> Sandbox Service
            </span>
          )}
          secondary={`With sandboxing enabled this service wont share any cookies or information with any other services`}
          checked={sandboxFromMailbox}
          onChange={(evt, toggled) => accountActions.changeServiceSandboxing(serviceId, toggled)} />
      </SettingsListSection>
    )
  }
}

export default ServiceAdvancedSection
