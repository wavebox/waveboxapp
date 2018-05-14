import './Welcome.less'
import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import { userStore } from 'stores/user'
import { RaisedButton, FontIcon, FlatButton } from 'material-ui'
import Resolver from 'Runtime/Resolver'

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflowY: 'auto',
    zIndex: 4
  },

  // Intro
  intro: {
    color: Colors.blueGrey800,
    textAlign: 'center'
  },
  introIcon: {
    height: 150,
    width: 150
  },
  introTitle: {
    fontWeight: '300'
  },
  introSubtitle: {
    fontWeight: '300'
  },
  extraActionButton: {
    display: 'inline-block',
    marginLeft: 16,
    marginRight: 16
  },
  addButton: {
    height: 58,
    marginTop: 24,
    marginBottom: 16
  }
}

export default class Welcome extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      user: userStore.getState().user
    }
  })()

  userChanged = (userState) => {
    this.setState({ user: userState.user })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the generic add wizard
  */
  handleOpenAddWizard = () => {
    window.location.hash = '/mailbox_wizard/add'
  }

  /**
  * Opens the account screen in settings
  */
  handleLoginWavebox = () => {
    window.location.hash = '/account/auth/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { user } = this.state

    return (
      <div style={styles.container}>
        <div className='ReactCompontent-Welcome-Clouds'>
          <div className='ReactCompontent-Welcome-Cloud Foreground' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_365.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Background' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_evernote.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Foreground' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_facebook.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Background' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_github.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Foreground' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_gmail.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Background' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_mail.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Background' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_mailchimp.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Background' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_salesforce.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Foreground' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_slack.png')}")`}} />
          <div className='ReactCompontent-Welcome-Cloud Foreground' style={{backgroundImage: `url("${Resolver.image('clouds/cloud_trello.png')}")`}} />
        </div>
        <div style={styles.contentContainer}>
          <div>
            <div style={styles.intro}>
              <img style={styles.introIcon} src='../../icons/app.svg' />
              <div style={styles.accounts}>
                <RaisedButton
                  onClick={this.handleOpenAddWizard}
                  backgroundColor={Colors.blueGrey900}
                  labelColor='#FFFFFF'
                  style={styles.addButton}
                  labelStyle={{ fontSize: '20px', fontWeight: '300' }}
                  icon={<FontIcon className='material-icons' style={{ marginTop: -8 }}>add_circle</FontIcon>}
                  label='Add your first account' />
              </div>
              {!user.isLoggedIn ? (
                <FlatButton
                  onClick={this.handleLoginWavebox}
                  labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: Colors.blueGrey800 }}
                  label='Use your Wavebox membership on this machine' />
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
