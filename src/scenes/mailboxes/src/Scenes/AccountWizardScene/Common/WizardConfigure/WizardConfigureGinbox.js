import React from 'react'
import PropTypes from 'prop-types'
import WizardConfigureUnreadModeOption from './WizardConfigureUnreadModeOption'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import { withStyles } from '@material-ui/core/styles'
import yellow from '@material-ui/core/colors/yellow'
import lightBlue from '@material-ui/core/colors/lightBlue'
import { accountActions, accountStore } from 'stores/account'
import GoogleInboxService from 'shared/Models/ACAccounts/Google/GoogleInboxService'
import GoogleInboxServiceReducer from 'shared/AltStores/Account/ServiceReducers/GoogleInboxServiceReducer'

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
  }
}

@withStyles(styles)
class WizardConfigureGinbox extends React.Component {
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
        unreadMode: service.unreadMode,
        serviceId: service.id
      } : {
        unreadMode: undefined,
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
      unreadMode: service.unreadMode,
      serviceId: service.id
    } : {
      unreadMode: undefined,
      serviceId: undefined
    }
  })()

  accountUpdated = (accountState) => {
    const service = accountState.getService(this.props.serviceId)

    this.setState(service ? {
      unreadMode: service.unreadMode,
      serviceId: service.id
    } : {
      unreadMode: undefined,
      serviceId: undefined
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a mode being picked by updating the mailbox
  * @param unreadMode: the picked unread mode
  */
  handleModePicked = (unreadMode) => {
    const { serviceId } = this.state
    accountActions.reduceService(serviceId, GoogleInboxServiceReducer.setUnreadMode, unreadMode)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      serviceId,
      onRequestCancel,
      classes,
      ...passProps
    } = this.props
    const { unreadMode } = this.state

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        serviceId={serviceId}
        {...passProps}>
        <h2 className={classes.heading}>Pick which unread mode to use</h2>
        <p className={classes.subHeading}>
          Google Inbox organizes your emails into bundles. You can configure
          Wavebox to notify you about these or emails when they arrive depending
          on how you use Google Inbox.
        </p>
        <div className={classes.unreadOptions}>
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={yellow[700]}
            selected={unreadMode === GoogleInboxService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED}
            onSelected={() => this.handleModePicked(GoogleInboxService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED)}
            name='Unread Unbundled Messages'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Unread Unbundled Messages</h3>
                <img className={classes.popoverPreviewImage} src='../../images/ginbox_mode_unreadunbundled_small.png' />
                <p>
                  Some new emails are automatically placed in bundles such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. You'll only be notified about emails
                  that aren't placed in bundles such as these. This is default behaviour also seen
                  in the iOS and Android Inbox Apps.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={lightBlue[700]}
            selected={unreadMode === GoogleInboxService.UNREAD_MODES.INBOX_UNREAD}
            onSelected={() => this.handleModePicked(GoogleInboxService.UNREAD_MODES.INBOX_UNREAD)}
            name='Unread Inbox'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Unread Inbox</h3>
                <img className={classes.popoverPreviewImage} src='../../images/ginbox_mode_inbox_small.png' />
                <p>
                  Some new emails are automatically placed in bundles such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. You'll be notified about the total amount
                  of unread emails in your account, whether they are in a bundle or not.
                </p>
              </div>
            )} />
        </div>
        <p className={classes.extraSubHeading}>Hover over each choice for more information</p>
      </WizardConfigureDefaultLayout>
    )
  }
}

export default WizardConfigureGinbox
