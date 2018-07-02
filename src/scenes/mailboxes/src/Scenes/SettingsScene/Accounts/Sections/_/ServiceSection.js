import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import CoreService from 'shared/Models/Accounts/CoreService'
import Resolver from 'Runtime/Resolver'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from '@material-ui/core/styles'
import { Avatar } from '@material-ui/core'
import grey from '@material-ui/core/colors/grey'
import ServiceSectionToolbarControls from './ServiceSectionToolbarControls'

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
          <ServiceSectionToolbarControls
            className={classes.toolbarControls}
            mailboxId={mailbox.id}
            serviceType={serviceType}
            isSingleService={isSingleService}
            isDefaultService={isDefaultService}
            isServiceEnabled={!!service}
            isFirstService={isFirst}
            isLastService={isLast} />
        </SettingsListItem>
        <div className={classes.childrenWrap}>
          {children}
        </div>
      </SettingsListSection>
    )
  }
}

export default ServiceSection
