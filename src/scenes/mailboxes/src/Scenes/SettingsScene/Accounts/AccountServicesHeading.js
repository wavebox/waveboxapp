import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import classNames from 'classnames'
import { Button, Tooltip, IconButton } from '@material-ui/core'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import { accountStore, accountActions } from 'stores/account'
import { ACCOUNT_TEMPLATES } from 'shared/Models/ACAccounts/AccountTemplates'
import Resolver from 'Runtime/Resolver'
import ServiceFactory from 'shared/Models/ACAccounts/ServiceFactory'
import CoreACService from 'shared/Models/ACAccounts/CoreACService'

const styles = {
  root: {
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  // Header
  heading: {
    marginTop: 30,
    color: grey[900],
    fontWeight: 'normal',
    marginBottom: 10
  },
  headingInfo: {
    marginTop: -10,
    marginBottom: 10,
    color: grey[700]
  },

  // Footer
  footerInfo: {
    marginTop: 10,
    marginBottom: 10,
    color: grey[700]
  },

  // Action
  actionContainer: {
    textAlign: 'center'
  },
  buttonIcon: {
    marginRight: 6
  },

  // Suggested
  suggestedInfo: {
    color: grey[700],
    fontSize: '85%',
    marginBottom: 0
  },
  suggestedLogoContainer: {
    textAlign: 'center',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16
  },
  suggestedLogo: {
    display: 'inline-block',
    width: 32,
    height: 32,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
}

@withStyles(styles)
class AccountServicesHeading extends React.Component {
  /* **************************************************************************/
  // class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    renderHeaderText: PropTypes.bool.isRequired,
    renderFooterText: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      const accountState = accountStore.getState()
      const mailbox = accountState.getMailbox(nextProps.mailboxId)
      this.setState({
        templateType: mailbox ? mailbox.templateType : undefined,
        suggestedServiceUILocation: mailbox ? mailbox.suggestedServiceUILocation : undefined
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const mailbox = accountState.getMailbox(this.props.mailboxId)
    return {
      templateType: mailbox ? mailbox.templateType : undefined,
      suggestedServiceUILocation: mailbox ? mailbox.suggestedServiceUILocation : undefined
    }
  })()

  accountUpdated = (accountState) => {
    const mailbox = accountState.getMailbox(this.props.mailboxId)
    this.setState({
      templateType: mailbox ? mailbox.templateType : undefined,
      suggestedServiceUILocation: mailbox ? mailbox.suggestedServiceUILocation : undefined
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Adds a suggested service
  * @param evt: the event that fired
  * @param serviceType: the type of service to add
  */
  handleAddSuggested = (evt, serviceType) => {
    const { mailboxId } = this.props
    const { suggestedServiceUILocation } = this.state
    const service = CoreACService.createJS(undefined, mailboxId, serviceType)
    const serviceId = service.id
    accountActions.createService(mailboxId, suggestedServiceUILocation, service)

    // The worst bit of UI here
    window.location.hash = '/spinner'
    setTimeout(() => {
      window.location.hash = `/settings/accounts/${mailboxId}:${serviceId}`
    }, 1000)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the suggested services
  * @param classes: the classes to use
  * @param templateType: the type of template
  * @return jsx or undefined
  */
  renderSuggestedServices (classes, templateType) {
    if (!templateType) { return undefined }
    if (!ACCOUNT_TEMPLATES[templateType]) { return undefined }
    if (!ACCOUNT_TEMPLATES[templateType].serviceTypes) { return undefined }
    if (ACCOUNT_TEMPLATES[templateType].serviceTypes.length <= 1) { return undefined }

    return (
      <div>
        <p className={classes.suggestedInfo}>Why not add one of these commonly used services...</p>
        <div className={classes.suggestedLogoContainer}>
          {ACCOUNT_TEMPLATES[templateType].serviceTypes.map((serviceType) => {
            const ServiceClass = ServiceFactory.serviceClass(serviceType)
            return (
              <Tooltip key={serviceType} title={ServiceClass.humanizedType}>
                <IconButton onClick={(evt) => this.handleAddSuggested(evt, serviceType)}>
                  <div
                    className={classes.suggestedLogo}
                    style={{ backgroundImage: `url("${Resolver.image(ServiceClass.humanizedLogoAtSize(128))}")` }} />
                </IconButton>
              </Tooltip>
            )
          })}
        </div>
      </div>
    )
  }

  render () {
    const {
      mailboxId,
      classes,
      className,
      renderHeaderText,
      renderFooterText,
      ...passProps
    } = this.props
    const { templateType } = this.state

    return (
      <div className={classNames(className, classes.root)} {...passProps}>
        {renderHeaderText ? (
          <React.Fragment>
            <h2 className={classes.heading}>Services</h2>
            <p className={classes.headingInfo}>
              Your account is split into seperate services each with their own
              tab and set of behaviours. You can enable, disable &amp; change the
              way these services behave below
            </p>
          </React.Fragment>
        ) : undefined}
        {renderFooterText ? (
          <React.Fragment>
            <p className={classes.footerInfo}>
              Your account is split into seperate services each with their own
              tab and set of behaviours. You can enable, disable &amp; change the
              way these services behave above
            </p>
          </React.Fragment>
        ) : undefined}
        <p className={classes.actionContainer}>
          <Button
            color='primary'
            variant='raised'
            size='large'
            onClick={() => {
              window.location.hash = `/mailbox_wizard/add/${mailboxId}`
            }}>
            <LibraryAddIcon className={classes.buttonIcon} />
            Add another Service
          </Button>
        </p>
        {this.renderSuggestedServices(classes, templateType)}
      </div>
    )
  }
}

export default AccountServicesHeading
