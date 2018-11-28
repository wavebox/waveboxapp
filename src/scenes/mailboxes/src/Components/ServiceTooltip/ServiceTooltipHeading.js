import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import { accountStore } from 'stores/account'
import ThemeTools from 'wbui/Themes/ThemeTools'
import FARGemIcon from 'wbfa/FARGem'
import FASExclamationIcon from 'wbfa/FASExclamation'
import TooltipHeading from 'wbui/TooltipHeading'
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp'

const styles = (theme) => ({
  proIcon: {
    color: ThemeTools.getValue(theme, 'wavebox.popover.color'),
    fontSize: 14,
    marginRight: 2
  },
  authInvalidText: {
    color: red['A200'],
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  authInvalidIcon: {
    color: red['A200'],
    width: 14,
    height: 14,
    marginRight: 6
  }
})

@withStyles(styles, { withTheme: true })
class ServiceTooltipHeading extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onOpenSettings: PropTypes.func.isRequired,
    onReauthenticate: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateServiceState(nextProps.serviceId))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateServiceState(this.props.serviceId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateServiceState(this.props.serviceId, accountState))
  }

  /**
  * @param serviceId: the id of the service
  * @param accountState=autoget: the current account state
  * @return state object
  */
  generateServiceState (serviceId, accountState = accountStore.getState()) {
    const mailbox = accountState.getMailboxForService(serviceId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return mailbox && service && serviceData ? {
      hasMembers: true,
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(mailbox.id)
      ),
      humanizedServiceTypeShort: service.humanizedTypeShort,
      humanizedServiceType: service.humanizedType,
      isRestricted: accountState.isServiceRestricted(serviceId),
      isAuthenticationInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId)
    } : {
      hasMembers: false
    }
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  handleSuppressContextMenu = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
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
      theme,
      children,
      onOpenSettings,
      onReauthenticate,
      ...passProps
    } = this.props
    const {
      displayName,
      humanizedServiceTypeShort,
      humanizedServiceType,
      hasMembers,
      isRestricted,
      isAuthenticationInvalid
    } = this.state
    if (!hasMembers) { return false }

    const primary = displayName === humanizedServiceTypeShort || displayName === humanizedServiceType
      ? displayName
      : `${humanizedServiceTypeShort} : ${displayName}`
    let secondary
    if (isRestricted) {
      secondary = (
        <span>
          <FARGemIcon className={classes.proIcon} />
          <span>Upgrade to Pro</span>
        </span>
      )
    } else if (isAuthenticationInvalid) {
      secondary = (
        <span className={classes.authInvalidText} onClick={onReauthenticate}>
          <FASExclamationIcon className={classes.authInvalidIcon} />
          <span>Authentication Problem. Click to reauthenticate</span>
        </span>
      )
    }

    return (
      <TooltipHeading
        primary={primary}
        secondary={secondary}
        actionIcon={<SettingsSharpIcon />}
        onActionClick={onOpenSettings}
        {...passProps} />
    )
  }
}

export default ServiceTooltipHeading
