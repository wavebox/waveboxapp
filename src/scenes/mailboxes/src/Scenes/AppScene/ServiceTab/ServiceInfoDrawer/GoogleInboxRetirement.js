import PropTypes from 'prop-types'
import React from 'react'
import { accountActions } from 'stores/account'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import shallowCompare from 'react-addons-shallow-compare'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import ServiceInfoPanelActionButton from 'wbui/ServiceInfoPanelActionButton'
import ServiceInfoPanelActions from 'wbui/ServiceInfoPanelActions'
import ServiceInfoPanelBody from 'wbui/ServiceInfoPanelBody'
import ServiceInfoPanelContent from 'wbui/ServiceInfoPanelContent'
import ServiceInfoPanelTitle from 'wbui/ServiceInfoPanelTitle'
import Resolver from 'Runtime/Resolver'
import blue from '@material-ui/core/colors/blue'
import GoogleInboxServiceReducer from 'shared/AltStores/Account/ServiceReducers/GoogleInboxServiceReducer'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
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
  hr: {
    borderBottom: '2px solid #b3b3b3',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none'
  }
}

@withStyles(styles)
class GoogleInboxRetirement extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleMoreGoogleInfoClick = (evt) => {
    WBRPCRenderer.wavebox.openExternal('https://www.google.com/inbox/')
  }

  handleOpenBlog = (evt) => {
    WBRPCRenderer.wavebox.openExternal('https://blog.wavebox.io/inbox_to_gmail/')
  }

  handleOpenShortBlog = (evt) => {
    WBRPCRenderer.wavebox.openExternal('https://blog.wavebox.io/simple-switch-from-google-inbox-to-gmail/')
  }

  handleLater = (evt) => {
    accountActions.reduceService(
      this.props.serviceId,
      GoogleInboxServiceReducer.setGinboxSeenRetirementVersion,
      userStore.getState().wireConfigGoogleInboxRetirementVersion()
    )
  }

  handleConvert = (evt) => {
    accountActions.convertGoogleInboxToGmail(this.props.serviceId, false)
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
        <ServiceInfoPanelBody actions={2}>
          <div className={classes.headImgContainer}>
            <img className={classes.headImg} src={Resolver.image('google/logo_ginbox_512px.png')} />
            <img className={classes.headImg} src={Resolver.image('google/logo_gmail_512px.png')} />
          </div>
          <ServiceInfoPanelTitle>Google Inbox is signing off</ServiceInfoPanelTitle>
          <p>
            Google are retiring Inbox at the end of March 2019. Here at Wavebox HQ we've
            been busy making our Gmail support even better and now that the new Gmail has
            a fresh new look, with the top Inbox features like snooze, nudges and more
            there's never been a better time to switch to the new Gmail.
            <br />
            <span className={classes.link} onClick={this.handleMoreGoogleInfoClick}>Learn more</span>
          </p>
          <p>
            We've written a comprehensive article about making the move from Google Inbox
            to Gmail, to help you get started and setup as quickly as possible.
            <br />
            <span className={classes.link} onClick={this.handleOpenBlog}>Read the article</span>
          </p>
          <hr className={classes.hr} />
          <p>
            Once you're ready to move to the new Gmail, choose convert below. If you want to do
            it another time, right click your Google Inbox account icon at any time and pick Convert.
            <br />
            <span className={classes.link} onClick={this.handleOpenShortBlog}>Find out how convert works</span>
          </p>
        </ServiceInfoPanelBody>
        <ServiceInfoPanelActions actions={2}>
          <ServiceInfoPanelActionButton
            variant='contained'
            onClick={this.handleLater}>
            <AccessTimeIcon className={classes.buttonIcon} />
            Remind me later
          </ServiceInfoPanelActionButton>
          <ServiceInfoPanelActionButton
            color='primary'
            variant='contained'
            onClick={this.handleConvert}>
            <CompareArrowsIcon className={classes.buttonIcon} />
            Convert to Gmail
          </ServiceInfoPanelActionButton>
        </ServiceInfoPanelActions>
      </ServiceInfoPanelContent>
    )
  }
}

export default GoogleInboxRetirement
