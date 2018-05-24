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
  toolbar: {
    backgroundColor: grey[300],
    flexDirection: 'row',
    marginTop: -4,
    marginBottom: -4,
    height: 47
  },
  toolbarInfo: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  toolbarControls: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  serviceAvatar: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    border: '2px solid rgb(139, 139, 139)',
    marginRight: 6
  },
  childrenWrap: {
    paddingLeft: 12,
    paddingRight: 12
  }
}

@withStyles(styles)
class ServiceSection extends React.Component {
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

  render () {
    const { classes, mailbox, serviceType, children, style, ...passProps } = this.props
    const service = mailbox.serviceForType(serviceType)
    const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)

    const isSingleService = mailbox.supportedServiceTypes === 1
    const serviceIndex = mailbox.additionalServiceTypes.findIndex((type) => type === serviceType)
    const isFirst = serviceIndex === 0
    const isLast = serviceIndex === mailbox.additionalServiceTypes.length - 1
    const isDefaultService = serviceType === CoreService.SERVICE_TYPES.DEFAULT

    return (
      <SettingsListSection {...passProps}>
        <SettingsListItem className={classes.toolbar}>
          <div className={classes.toolbarInfo}>
            <Avatar
              className={classes.serviceAvatar}
              src={Resolver.image(service ? service.humanizedLogoAtSize(128) : serviceClass.humanizedLogo)} />
            {(service || serviceClass).humanizedType}
          </div>
          {!isSingleService && !isDefaultService ? (
            <div className={classes.toolbarControls}>
              {service ? (
                <Tooltip title='Disable'>
                  <div>
                    <IconButton
                      disabled={isDefaultService}
                      onClick={() => mailboxActions.reduce(mailbox.id, MailboxReducer.removeService, serviceType)}>
                      <CheckBoxIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              ) : (
                <Tooltip title='Enable'>
                  <div>
                    <IconButton onClick={() => mailboxActions.reduce(mailbox.id, MailboxReducer.addService, serviceType)}>
                      <CheckBoxOutlineIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              )}
              {service ? (
                <Tooltip title='Move up'>
                  <div>
                    <IconButton
                      disabled={isFirst}
                      onChange={() => mailboxActions.reduce(mailbox.id, MailboxReducer.moveServiceUp, serviceType)}>
                      <ArrowUpwardIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              ) : undefined}
              {service ? (
                <Tooltip title='Move down'>
                  <div>
                    <IconButton
                      disabled={isLast}
                      onChange={() => mailboxActions.reduce(mailbox.id, MailboxReducer.moveServiceDown, serviceType)}>
                      <ArrowDownwardIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              ) : undefined}
            </div>
          ) : (
            <div className={classes.toolbarControls} />
          )}
        </SettingsListItem>
        <div className={classes.childrenWrap}>
          {children}
        </div>
      </SettingsListSection>
    )
  }
}

export default ServiceSection
