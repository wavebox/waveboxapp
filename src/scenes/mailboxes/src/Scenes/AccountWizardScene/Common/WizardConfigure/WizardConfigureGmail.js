import React from 'react'
import PropTypes from 'prop-types'
import { accountActions, accountStore } from 'stores/account'
import WizardConfigureUnreadModeOption from './WizardConfigureUnreadModeOption'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import { withStyles } from '@material-ui/core/styles'
import yellow from '@material-ui/core/colors/yellow'
import lightBlue from '@material-ui/core/colors/lightBlue'
import cyan from '@material-ui/core/colors/cyan'
import teal from '@material-ui/core/colors/teal'
import orange from '@material-ui/core/colors/orange'
import blue from '@material-ui/core/colors/blue'
import GoogleMailService from 'shared/Models/ACAccounts/Google/GoogleMailService'
import GoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/GoogleMailServiceReducer'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  // Typography
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  },
  extraSubHeading: {
    fontWeight: 300,
    fontSize: 14
  },

  // Unread
  unreadOptions: {
    marginTop: 40,
    marginBottom: 40
  },
  unreadOption: {
    display: 'inline-block',
    verticalAlign: 'top'
  },

  // Popover
  popoverContainer: {
    maxWidth: 320
  },
  popoverPreviewImage: {
    maxWidth: '100%',
    margin: '0px auto',
    display: 'block'
  },

  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[600]
  }
}

@withStyles(styles)
class WizardConfigureGmail extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
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
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      const service = accountState.getService(nextProps.serviceId)
      this.setState(service ? {
        inboxType: service.inboxType,
        serviceId: service.id
      } : {
        inboxType: undefined,
        serviceId: undefined
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const service = accountState.getService(this.props.serviceId)

    return service ? {
      inboxType: service.inboxType,
      serviceId: service.id
    } : {
      inboxType: undefined,
      serviceId: undefined
    }
  })()

  accountUpdated = (accountState) => {
    const service = accountState.getService(this.props.serviceId)

    this.setState(service ? {
      inboxType: service.inboxType,
      serviceId: service.id
    } : {
      inboxType: undefined,
      serviceId: undefined
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a mode being picked by updating the mailbox
  * @param inboxType: the picked inbox type
  */
  handleModePicked = (inboxType) => {
    const { serviceId } = this.state
    accountActions.reduceService(serviceId, GoogleMailServiceReducer.setInboxType, inboxType)
  }

  /**
  * @param evt: the event that fired
  */
  handleOpenKBHelp = (evt) => {
    evt.preventDefault()

    WBRPCRenderer.wavebox.openExternal('https://wavebox.io/kb/gmail-inbox-type')
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { serviceId, onRequestCancel, classes, ...passProps } = this.props
    const { inboxType } = this.state

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        serviceId={serviceId}
        {...passProps}>
        <h2 className={classes.heading}>Choose your Inbox type</h2>
        <p className={classes.subHeading}>
          Your Gmail account has different inbox types, each organising your emails
          differently. Select the one that matches your existing settings. Don't worry
          if you don't know it is, you can change it later!
        </p>
        <div className={classes.unreadOptions}>
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={yellow[700]}
            selected={inboxType === GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT}
            onSelected={() => this.handleModePicked(GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT)}
            name='Default'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Default (Categories or tabs)</h3>
                <img className={classes.popoverPreviewImage} src='../../images/gmail_inboxtype_default.png' />
                <p>
                  Your new emails are automatically sorted into Categories such
                  as <em>Social</em> and <em>Promotions</em>. Typically
                  you will see a number of category tabs above your emails.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={lightBlue[700]}
            selected={inboxType === GoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT}
            onSelected={() => this.handleModePicked(GoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT)}
            name='Important First'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Important First</h3>
                <img className={classes.popoverPreviewImage} src='../../images/gmail_inboxtype_important.png' />
                <p>
                  Emails are automatically given an importance flag and those deemed important will be shown
                  at the top of your inbox. Typically you'll see
                  an <em>Important</em> and <em>Everything else</em> section in your inbox.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={cyan[700]}
            selected={inboxType === GoogleMailService.INBOX_TYPES.GMAIL_UNREAD}
            onSelected={() => this.handleModePicked(GoogleMailService.INBOX_TYPES.GMAIL_UNREAD)}
            name='Unread First'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Unread First</h3>
                <img className={classes.popoverPreviewImage} src='../../images/gmail_inboxtype_unread.png' />
                <p>
                  Your new emails are sent directly to your Inbox and those that have not been read are placed
                  at the top. Typically you'll see an <em>Unread</em> and <em>Everything else</em> title in your inbox.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={teal[700]}
            selected={inboxType === GoogleMailService.INBOX_TYPES.GMAIL_STARRED}
            onSelected={() => this.handleModePicked(GoogleMailService.INBOX_TYPES.GMAIL_STARRED)}
            name='Starred First'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Starred First</h3>
                <img className={classes.popoverPreviewImage} src='../../images/gmail_inboxtype_starred.png' />
                <p>
                  Your new emails are sent directly to your Inbox and appear in time order. Those that you've
                  starred will appear at the top. Typically you'll see
                  a <em>Starred</em> and <em>Everything else</em> section in your inbox.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={orange[700]}
            selected={inboxType === GoogleMailService.INBOX_TYPES.GMAIL_PRIORITY}
            onSelected={() => this.handleModePicked(GoogleMailService.INBOX_TYPES.GMAIL_PRIORITY)}
            name='Priority Inbox'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Priority Inbox</h3>
                <img className={classes.popoverPreviewImage} src='../../images/gmail_inboxtype_priority.png' />
                <p>
                  Emails are automatically given an importance flag and those deemed important and unread, or those that
                  have been starred will be shown at the top of your inbox. Typically you'll see
                  an <em>Important and Unread</em>, <em>Starred</em> and <em>Everything else</em> section in your inbox.
                </p>
              </div>
            )} />
        </div>
        <p className={classes.extraSubHeading}>
          Hover over each choice for more information. Still not sure or want some help for
          later? <a href='#' className={classes.link} onClick={this.handleOpenKBHelp}>View the KB Article for more info.</a>
        </p>
      </WizardConfigureDefaultLayout>
    )
  }
}

export default WizardConfigureGmail
