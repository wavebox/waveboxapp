import PropTypes from 'prop-types'
import React from 'react'
import { accountActions, accountStore } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceInfoPanelActionButton from 'wbui/ServiceInfoPanelActionButton'
import ServiceInfoPanelActions from 'wbui/ServiceInfoPanelActions'
import ServiceInfoPanelBody from 'wbui/ServiceInfoPanelBody'
import ServiceInfoPanelContent from 'wbui/ServiceInfoPanelContent'
import ServiceInfoPanelTitle from 'wbui/ServiceInfoPanelTitle'
import Resolver from 'Runtime/Resolver'
import blue from '@material-ui/core/colors/blue'
import GoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/GoogleMailServiceReducer'
import GoogleMailService from 'shared/Models/ACAccounts/Google/GoogleMailService'
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@material-ui/core'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  headImgContainer: {
    textAlign: 'center'
  },
  headImg: {
    width: 128,
    height: 128,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8
  },
  buttonIcon: {
    marginRight: 6
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[600]
  },
  list: {
    paddingLeft: 20,
    '>li': {
      marginBottom: 8
    }
  },
  inputPaper: {
    padding: '8px 16px',
    marginLeft: -8,
    marginRight: -8
  },
  helpSection: {
    marginTop: 32,
    fontSize: '85%'
  }
}

@withStyles(styles)
class GoogleInboxToGmailHelper extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
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
      const accountState = accountStore.getState()
      this.setState({
        inboxType: (accountState.getService(nextProps.serviceId) || {}).inboxType || GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      inboxType: (accountState.getService(this.props.serviceId) || {}).inboxType || GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      inboxType: (accountState.getService(this.props.serviceId) || {}).inboxType || GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleOpenInboxTypeKB = (evt) => {
    WBRPCRenderer.wavebox.openExternal('https://wavebox.io/kb/gmail-inbox-type')
  }

  handleChangeInboxType = (evt) => {
    accountActions.reduceService(
      this.props.serviceId,
      GoogleMailServiceReducer.setInboxType,
      evt.target.value
    )
  }

  handleDone = (evt) => {
    accountActions.reduceService(
      this.props.serviceId,
      GoogleMailServiceReducer.setHasSeenGoogleInboxToGmailHelper,
      true
    )
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
    const {
      inboxType
    } = this.state

    return (
      <ServiceInfoPanelContent {...passProps}>
        <ServiceInfoPanelBody actions={1}>
          <div className={classes.headImgContainer}>
            <img className={classes.headImg} src={Resolver.image('google/logo_gmail_512px.png')} />
          </div>
          <ServiceInfoPanelTitle>Welcome to Gmail</ServiceInfoPanelTitle>
          <p>
            Welcome to your new Gmail account. We've converted most things
            automatically for you, there's just one thing you need to setup;
            the Inbox Type you're using. When Wavebox knows which Inbox
            Type you're using it will display the correct count of unread
            messages and the most relevant notifications.
          </p>
          <Paper className={classes.inputPaper}>
            <FormControl fullWidth>
              <InputLabel>Inbox Type</InputLabel>
              <Select
                MenuProps={{
                  disableEnforceFocus: true,
                  MenuListProps: { dense: true }
                }}
                fullWidth
                value={inboxType}
                onChange={this.handleChangeInboxType}>
                <MenuItem value={GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT}>
                  Default (Categories or tabs)
                </MenuItem>
                <MenuItem value={GoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT}>
                  Important first
                </MenuItem>
                <MenuItem value={GoogleMailService.INBOX_TYPES.GMAIL_UNREAD}>
                  Unread first
                </MenuItem>
                <MenuItem value={GoogleMailService.INBOX_TYPES.GMAIL_STARRED}>
                  Starred first
                </MenuItem>
                <MenuItem value={GoogleMailService.INBOX_TYPES.GMAIL_PRIORITY}>
                  Priority Inbox
                </MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <div className={classes.helpSection}>
            <h4>Which Inbox Type am I using?</h4>
            <p>
              If you're not sure which Inbox Type you're using here's some
              handy info to help you figure it out.
            </p>
            <ul className={classes.list}>
              <li>
                <strong>Default (categories & tabs): </strong>
                Your new emails are automatically sorted into Categories such
                as <em>Social</em> and <em>Promotions</em>. Typically
                you will see a number of category tabs above your emails.
              </li>
              <li>
                <strong>Important First: </strong>
                Emails are automatically given an importance flag and those deemed important will be shown
                at the top of your inbox. Typically you'll see
                an <em>Important</em> and <em>Everything else</em> section in your inbox.
              </li>
              <li>
                <strong>Unread First: </strong>
                Your new emails are sent directly to your Inbox and those that have not been read are placed
                at the top. Typically you'll see an <em>Unread</em> and <em>Everything else</em> title in your inbox.
              </li>
              <li>
                <strong>Starred First: </strong>
                Your new emails are sent directly to your Inbox and appear in time order. Those that you've
                starred will appear at the top. Typically you'll see
                a <em>Starred</em> and <em>Everything else</em> section in your inbox.
              </li>
              <li>
                <strong>Priority Inbox: </strong>
                Emails are automatically given an importance flag and those deemed important and unread, or those that
                have been starred will be shown at the top of your inbox. Typically you'll see
                an <em>Important and Unread</em>, <em>Starred</em> and <em>Everything else</em> section in your inbox.
              </li>
            </ul>
            <h4>I'm still not sure</h4>
            <p>
              Don't worry! You can change the Inbox Type anytime through Wavebox Settings.
              There's some handy information on <span className={classes.link} onClick={this.handleOpenInboxTypeKB}>how to do this here</span>.
            </p>
          </div>
        </ServiceInfoPanelBody>
        <ServiceInfoPanelActions actions={1}>
          <ServiceInfoPanelActionButton
            color='primary'
            variant='contained'
            onClick={this.handleDone}>
            Done
          </ServiceInfoPanelActionButton>
        </ServiceInfoPanelActions>
      </ServiceInfoPanelContent>
    )
  }
}

export default GoogleInboxToGmailHelper
