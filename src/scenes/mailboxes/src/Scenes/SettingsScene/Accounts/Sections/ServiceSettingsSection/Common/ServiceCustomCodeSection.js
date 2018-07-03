import PropTypes from 'prop-types'
import React from 'react'
import { accountActions, accountStore, accountDispatch } from 'stores/account'
import { USER_SCRIPTS_WEB_URL } from 'shared/constants'
import electron from 'electron'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import CodeIcon from '@material-ui/icons/Code'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import { Button } from '@material-ui/core'

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
  }
}

@withStyles(styles)
class ServiceCustomCodeSection extends React.Component {
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
      onRequestEditCustomCode,
      classes,
      ...passProps
    } = this.props
    const {
      hasService,
      customCSS,
      customJS
    } = this.state
    if (!hasService) { return false }

    return (
      <SettingsListSection title='Custom Code & Userscripts' icon={<CodeIcon />} {...passProps}>
        <SettingsListItem divider={false}>
          <div>
            <div>
              <Button
                size='small'
                variant='raised'
                onClick={() => {
                  onRequestEditCustomCode('Custom CSS', customCSS, (code) => {
                    accountActions.reduceService(serviceId, ServiceReducer.setCustomCSS, code)
                    accountDispatch.reload(serviceId)
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
                    accountDispatch.reload(serviceId)
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
      </SettingsListSection>
    )
  }
}

export default ServiceCustomCodeSection
