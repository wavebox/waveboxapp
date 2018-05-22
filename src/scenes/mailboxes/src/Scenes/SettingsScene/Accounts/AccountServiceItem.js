import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import Resolver from 'Runtime/Resolver'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from '@material-ui/core/styles'
import { Avatar, Tooltip, IconButton } from '@material-ui/core'
import grey from '@material-ui/core/colors/grey'
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

const styles = {
  serviceAvatar: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    border: '2px solid rgb(139, 139, 139)'
  },
  toolbar: {
    backgroundColor: grey[300]
  }
}

@withStyles(styles)
class AccountServiceItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    serviceType: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the enabled service
  * @param service: the service
  * @return jsx
  */
  renderEnabled (service) {
    const { classes, mailbox, serviceType, children, style, ...passProps } = this.props
    const isSingleService = mailbox.supportedServiceTypes === 1
    const serviceIndex = mailbox.additionalServiceTypes.findIndex((type) => type === serviceType)
    const isFirst = serviceIndex === 0
    const isLast = serviceIndex === mailbox.additionalServiceTypes.length - 1
    const isDefaultService = serviceType === CoreService.SERVICE_TYPES.DEFAULT

    return (
      <SettingsListSection
        title={(
          <span>
            <Avatar className={classes.serviceAvatar} src={Resolver.image(service.humanizedLogoAtSize(128))} />
            {service.humanizedType}
          </span>
        )}
        {...passProps}>
        {!isSingleService && !isDefaultService ? (
          <SettingsListItem className={classes.toolbar}>
            <Tooltip title='Disable'>
              <div>
                <IconButton
                  disabled={isDefaultService}
                  onChange={() => mailboxActions.reduce(mailbox.id, MailboxReducer.removeService, serviceType)}>
                  <CheckBoxIcon />
                </IconButton>
              </div>
            </Tooltip>
            <Tooltip title='Move up'>
              <div>
                <IconButton
                  disabled={isFirst}
                  onChange={() => mailboxActions.reduce(mailbox.id, MailboxReducer.moveServiceUp, serviceType)}>
                  <ArrowUpwardIcon />
                </IconButton>
              </div>
            </Tooltip>
            <Tooltip title='Move down'>
              <div>
                <IconButton
                  disabled={isLast}
                  onChange={() => mailboxActions.reduce(mailbox.id, MailboxReducer.moveServiceDown, serviceType)}>
                  <ArrowDownwardIcon />
                </IconButton>
              </div>
            </Tooltip>
          </SettingsListItem>
        ) : undefined}
        {children}
      </SettingsListSection>
    )
  }

  /**
  * Renders the disabled service
  * @return jsx
  */
  renderDisabled () {
    const { classes, mailbox, serviceType, style, ...passProps } = this.props
    const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)

    return (
      <SettingsListSection
        title={(
          <span>
            <Avatar className={classes.serviceAvatar} src={Resolver.image(serviceClass.humanizedLogo)} />
            {serviceClass.humanizedType}
          </span>
        )}
        {...passProps}>
        <SettingsListItem className={classes.toolbar}>
          <Tooltip title='Enable'>
            <IconButton onChange={() => mailboxActions.reduce(mailbox.id, MailboxReducer.addService, serviceType)}>
              <CheckBoxOutlineIcon />
            </IconButton>
          </Tooltip>
        </SettingsListItem>
      </SettingsListSection>
    )
  }

  render () {
    const { mailbox, serviceType } = this.props
    const service = mailbox.serviceForType(serviceType)
    if (service) {
      return this.renderEnabled(service)
    } else {
      return this.renderDisabled()
    }
  }
}

export default AccountServiceItem
