import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import styles from '../SettingStyles'
import * as Colors from 'material-ui/styles/colors'
import {
  Toolbar, ToolbarGroup, ToolbarTitle,
  Avatar, FontIcon, IconButton, Paper
} from 'material-ui'

export default class AccountServiceItem extends React.Component {
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
    const { mailbox, serviceType, children, style, ...passProps } = this.props
    const isSingleService = mailbox.supportedServiceTypes === 1
    const serviceIndex = mailbox.additionalServiceTypes.findIndex((type) => type === serviceType)
    const isFirst = serviceIndex === 0
    const isLast = serviceIndex === mailbox.additionalServiceTypes.length - 1
    const isDefaultService = serviceType === CoreService.SERVICE_TYPES.DEFAULT

    return (
      <Paper {...passProps} style={Object.assign({}, styles.servicePaper, style)}>
        <Toolbar {...passProps}>
          <ToolbarGroup>
            <Avatar
              size={36}
              src={'../../' + service.humanizedLogo}
              backgroundColor='white'
              style={{
                margin: '2px 10px 2px 2px',
                boxShadow: '0 0 0 2px rgb(139, 139, 139)'
              }} />
            <ToolbarTitle text={service.humanizedType} />
          </ToolbarGroup>
          {!isSingleService && !isDefaultService ? (
            <ToolbarGroup>
              <IconButton
                tooltip='Move Up'
                disabled={isFirst}
                onClick={() => mailboxActions.reduce(mailbox.id, MailboxReducer.moveServiceUp, serviceType)}>
                <FontIcon className='material-icons'>arrow_upwards</FontIcon>
              </IconButton>
              <IconButton
                tooltip='Move Down'
                disabled={isLast}
                onClick={() => mailboxActions.reduce(mailbox.id, MailboxReducer.moveServiceDown, serviceType)}>
                <FontIcon className='material-icons'>arrow_downwards</FontIcon>
              </IconButton>
              <IconButton
                tooltip='Disable'
                disabled={isDefaultService}
                onClick={() => mailboxActions.reduce(mailbox.id, MailboxReducer.removeService, serviceType)}
                iconStyle={{ color: Colors.lightBlue600 }}>
                <FontIcon className='material-icons'>check_box</FontIcon>
              </IconButton>
            </ToolbarGroup>
          ) : undefined}
        </Toolbar>
        <div style={styles.serviceBody}>
          {children}
        </div>
      </Paper>
    )
  }

  /**
  * Renders the disabled service
  * @return jsx
  */
  renderDisabled () {
    const { mailbox, serviceType, style, ...passProps } = this.props
    const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)

    return (
      <Paper {...passProps} style={Object.assign({}, styles.servicePaper, style)}>
        <Toolbar>
          <ToolbarGroup>
            <Avatar
              size={40}
              src={'../../' + serviceClass.humanizedLogo}
              backgroundColor='white'
              style={{ marginRight: 8, border: '2px solid rgb(139, 139, 139)' }} />
            <ToolbarTitle text={serviceClass.humanizedType} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton
              tooltip='Enable'
              onClick={() => mailboxActions.reduce(mailbox.id, MailboxReducer.addService, serviceType)}>
              <FontIcon className='material-icons'>check_box_outline_blank</FontIcon>
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </Paper>
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
