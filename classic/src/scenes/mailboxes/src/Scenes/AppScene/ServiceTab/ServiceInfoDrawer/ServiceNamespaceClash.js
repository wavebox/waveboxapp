import PropTypes from 'prop-types'
import React from 'react'
import { accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import ACCOUNT_WARNING_TYPES from 'shared/Models/ACAccounts/AccountWarningTypes'
import shallowCompare from 'react-addons-shallow-compare'
import InboxIcon from '@material-ui/icons/Inbox'
import PersonIcon from '@material-ui/icons/Person'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import lightBlue from '@material-ui/core/colors/lightBlue'
import lightGreen from '@material-ui/core/colors/lightGreen'
import FASUserCircleIcon from 'wbfa/FASUserCircle'
import ServiceInfoPanelActionButton from 'wbui/ServiceInfoPanelActionButton'
import ServiceInfoPanelActions from 'wbui/ServiceInfoPanelActions'
import ServiceInfoPanelBody from 'wbui/ServiceInfoPanelBody'
import ServiceInfoPanelContent from 'wbui/ServiceInfoPanelContent'
import ServiceInfoPanelTitle from 'wbui/ServiceInfoPanelTitle'

const styles = {
  'list': {
    paddingLeft: 30
  },
  nscIcons: {
    height: 160,
    textAlign: 'center'
  },
  nscIconContainer: {
    position: 'relative',
    display: 'inline-block',
    width: 80,
    height: 160
  },
  nscInboxIcon: {
    position: 'absolute',
    width: 80,
    height: 80,
    bottom: 0,
    left: '50%',
    marginLeft: -40,
    color: lightBlue[600]
  },
  nscPersonIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    bottom: 25,
    left: '50%',
    marginLeft: -20,
    color: lightBlue[600]
  },
  nscPersonAddArrowIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 100,
    left: '50%',
    marginLeft: -25,
    color: lightGreen[600]
  },
  nscPersonAddIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 65,
    left: '50%',
    marginLeft: -25,
    color: lightGreen[600]
  },
  buttonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class ServiceNamespaceClash extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
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
      ...passProps
    } = this.props

    return (
      <ServiceInfoPanelContent {...passProps}>
        <ServiceInfoPanelBody actions={3}>
          <div className={classes.nscIcons}>
            <span className={classes.nscIconContainer}>
              <InboxIcon className={classes.nscInboxIcon} />
              <PersonIcon className={classes.nscPersonIcon} />
            </span>
            <span className={classes.nscIconContainer}>
              <InboxIcon className={classes.nscInboxIcon} />
              <PersonIcon className={classes.nscPersonIcon} />
              <ArrowDownwardIcon className={classes.nscPersonAddArrowIcon} />
              <PersonIcon className={classes.nscPersonAddIcon} />
            </span>
            <span className={classes.nscIconContainer}>
              <InboxIcon className={classes.nscInboxIcon} />
              <PersonIcon className={classes.nscPersonIcon} />
            </span>
          </div>
          <ServiceInfoPanelTitle>Service Sandboxing</ServiceInfoPanelTitle>
          <p>
            It looks like this is the second service of this type that
            you've added to this account & sandbox. That's fine, but it's worth
            noting a few things before you continue...
          </p>
          <ul className={classes.list}>
            <li>
              Services in a single sandbox share the same cookies & login details.
              Some sites allow you to sign in as multiple users, it's recommended
              that you use different sandboxes in Wavebox for the best experience.
            </li>
            <li>
              Services that provide Wavebox sync in the background share the same
              credentials when used in the same sandbox. This means this service
              may provide the same unread counts and notifications as the one that
              is already setup.
            </li>
          </ul>
          <p>
            You can choose to keep the service here and continue, keep it here and
            place it into its own sandbox, or move it into its own account and sandbox.
          </p>
        </ServiceInfoPanelBody>
        <ServiceInfoPanelActions actions={3}>
          <ServiceInfoPanelActionButton
            color='primary'
            variant='contained'
            onClick={() => {
              accountActions.clearRuntimeWarning(serviceId, ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH)
              accountActions.changeServiceSandboxing(serviceId, true)
            }}>
            <InboxIcon className={classes.buttonIcon} />
            Keep here & sandbox
          </ServiceInfoPanelActionButton>
          <ServiceInfoPanelActionButton
            color='primary'
            variant='contained'
            onClick={() => {
              accountActions.clearRuntimeWarning(serviceId, ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH)
              accountActions.moveServiceToNewMailbox(serviceId)
            }}>
            <FASUserCircleIcon className={classes.buttonIcon} />
            Move to new Account
          </ServiceInfoPanelActionButton>
          <ServiceInfoPanelActionButton
            variant='contained'
            onClick={() => {
              accountActions.clearRuntimeWarning(serviceId, ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH)
            }}>
            Keep here
          </ServiceInfoPanelActionButton>
        </ServiceInfoPanelActions>
      </ServiceInfoPanelContent>
    )
  }
}

export default ServiceNamespaceClash
