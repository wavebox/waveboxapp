import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ACCOUNT_WARNING_TYPES from 'shared/Models/ACAccounts/AccountWarningTypes'
import shallowCompare from 'react-addons-shallow-compare'
import StyleMixins from 'wbui/Styles/StyleMixins'
import { Button, Paper, Slide } from '@material-ui/core'
import InboxIcon from '@material-ui/icons/Inbox'
import PersonIcon from '@material-ui/icons/Person'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import grey from '@material-ui/core/colors/grey'
import lightBlue from '@material-ui/core/colors/lightBlue'
import lightGreen from '@material-ui/core/colors/lightGreen'
import FASUserCircleIcon from 'wbfa/FASUserCircle'

const styles = {
  /**
  * Panel layout
  */
  panelRoot: {
    width: '100%',
    maxWidth: 420,
    minWidth: 320,
    backgroundColor: grey[300],
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0
  },
  panelContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  panelBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    paddingLeft: 24,
    paddingRight: 24,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars,

    '&.twoActions': { bottom: 90 },
    '&.threeActions': { bottom: 135 }
  },
  panelActions: {
    position: 'absolute',
    textAlign: 'center',
    left: 0,
    bottom: 0,
    right: 0,
    height: 0,
    paddingLeft: 30,
    paddingRight: 30,

    '&.twoActions': { height: 90 },
    '&.threeActions': { height: 135 }
  },
  panelActionButton: {
    margin: 4,
    width: '100%'
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  panelList: {
    paddingLeft: 30
  },

  /**
  * Tools
  */
  buttonIcon: {
    marginRight: 6
  },

  /**
  * Namespace clash
  */
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
  }
}

@withStyles(styles)
class ServiceInfoDrawer extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState({
        ...this.deriveWarningsFromAccount(nextProps.serviceId, accountStore.getState()),
        ...this.deriveServiceInfo(nextProps.serviceId, accountStore.getState())
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveWarningsFromAccount(this.props.serviceId, accountStore.getState()),
      ...this.deriveServiceInfo(this.props.serviceId, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState({
      ...this.deriveWarningsFromAccount(this.props.serviceId, accountState),
      ...this.deriveServiceInfo(this.props.serviceId, accountState)
    })
  }

  /**
  * Gets the service info from the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return a state update object
  */
  deriveServiceInfo (serviceId, accountState) {
    return {}
  }

  /**
  * Gets the warnings from the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return a state update object
  */
  deriveWarningsFromAccount (serviceId, accountState) {
    const warnings = {
      hasNamespaceClashWarning: !!accountState.getWarningForServiceAndType(
        serviceId,
        ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH
      )
    }
    const hasWarnings = !!Object.keys(warnings).find((k) => warnings[k])

    return {
      ...warnings,
      hasWarnings: hasWarnings
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the namespace clash warning
  * @param classes: the classes to use
  * @param serviceId: the id of the service
  * @return jsx
  */
  renderNamespaceClashWarning (classes, serviceId) {
    return (
      <div className={classes.panelContent}>
        <div className={classNames(classes.panelBody, 'threeActions')}>
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
          <h1 className={classes.panelTitle}>Service Sandboxing</h1>
          <p>
            It looks like this is the second service of this type that
            you've added to this account & sandbox. That's fine, but it's worth
            noting a few things before you continue...
          </p>
          <ul className={classes.panelList}>
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
        </div>
        <div className={classNames(classes.panelActions, 'threeActions')}>
          <Button
            color='primary'
            variant='raised'
            className={classes.panelActionButton}
            onClick={() => {
              accountActions.clearRuntimeWarning(serviceId, ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH)
              accountActions.changeServiceSandboxing(serviceId, true)
            }}>
            <InboxIcon className={classes.buttonIcon} />
            Keep here & sandbox
          </Button>
          <Button
            color='primary'
            variant='raised'
            className={classes.panelActionButton}
            onClick={() => {
              accountActions.clearRuntimeWarning(serviceId, ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH)
              accountActions.moveServiceToNewMailbox(serviceId)
            }}>
            <FASUserCircleIcon className={classes.buttonIcon} />
            Move to new Account
          </Button>
          <Button
            variant='raised'
            className={classes.panelActionButton}
            onClick={() => {
              accountActions.clearRuntimeWarning(serviceId, ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH)
            }}>
            Keep here
          </Button>
        </div>
      </div>
    )
  }

  render () {
    const {
      serviceId,
      className,
      classes,
      ...passProps
    } = this.props
    const {
      hasNamespaceClashWarning,
      hasWarnings
    } = this.state

    return (
      <Slide direction='left' in={hasWarnings} mountOnEnter unmountOnExit>
        <Paper
          className={classNames(classes.panelRoot, className)}
          elevation={16}
          square
          {...passProps}>
          {hasNamespaceClashWarning ? (
            this.renderNamespaceClashWarning(classes, serviceId)
          ) : undefined}
        </Paper>
      </Slide>
    )
  }
}

export default ServiceInfoDrawer
