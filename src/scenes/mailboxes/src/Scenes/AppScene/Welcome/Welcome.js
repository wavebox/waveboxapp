import React from 'react'
import { userStore } from 'stores/user'
import { Button } from 'material-ui'
import Resolver from 'Runtime/Resolver'
import blueGrey from 'material-ui/colors/blueGrey'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'
import AddCircleIcon from '@material-ui/icons/AddCircle'

const CLOUD_ANIMATION_DURATION = 120

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
    color: blueGrey[800],
    textAlign: 'center'
  },
  introIcon: {
    height: 150,
    width: 150
  },
  addButton: {
    height: 58,
    marginTop: 24,
    marginBottom: 16,
    fontSize: '20px',
    backgroundColor: blueGrey[900],
    color: blueGrey[50],
    '&:hover': {
      backgroundColor: blueGrey[800]
    },
    '&:active': {
      backgroundColor: blueGrey[600]
    }
  },
  loginButton: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: blueGrey[800]
  },

  // Clouds
  welcomeClouds: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    userSelect: 'none',
    background: 'radial-gradient(ellipse at center, #67d5ff 0%,#00adf8 100%)'
  },
  '@keyframes cloudFloat': {
    from: { transform: 'translateX(100%) translateZ(0)' },
    to: { transform: 'translateX(-15%) translateZ(0)' }
  },
  '@keyframes cloudFadeFloat': {
    '0%, 100%': { opacity: 0 },
    '5%, 90%': { opacity: 0.2 }
  },
  welcomeCloud: {
    position: 'absolute',
    width: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'auto 100%',
    height: 70,
    animationDuration: `${CLOUD_ANIMATION_DURATION}s`,
    animationIterationCount: 'infinite',
    animationFillMode: 'forwards',
    animationTimingFunction: 'linear',
    animationName: 'cloudFloat, cloudFadeFloat',

    '&.foreground': {
      height: '10%',
      minHeight: 20,
      zIndex: 3
    },
    '&.background': {
      height: '9%',
      minHeight: 8,
      animationDuration: `${CLOUD_ANIMATION_DURATION * 1.75}s`
    },
    '&:nth-child(1)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 1}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 8}s`,
      top: '39%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_365.png')}")`
    },
    '&:nth-child(2)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 2}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 16}s`,
      top: '63%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_evernote.png')}")`
    },
    '&:nth-child(3)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 3}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 24}s`,
      top: '33%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_facebook.png')}")`
    },
    '&:nth-child(4)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 4}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 32}s`,
      top: '21%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_github.png')}")`
    },
    '&:nth-child(5)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 5}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 40}s`,
      top: '75%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_gmail.png')}")`
    },
    '&:nth-child(6)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 6}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 48}s`,
      top: '51%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_mail.png')}")`
    },
    '&:nth-child(7)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 7}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 56}s`,
      top: '57%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_mailchimp.png')}")`
    },
    '&:nth-child(8)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 8}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 64}s`,
      top: '69%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_salesforce.png')}")`
    },
    '&:nth-child(9)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 9}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 72}s`,
      top: '45%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_slack.png')}")`
    },
    '&:nth-child(10)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 10}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 80}s`,
      top: '27%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_trello.png')}")`
    }
  }
}

@withStyles(styles)
class Welcome extends React.Component {
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
    const { className, classes, ...passProps } = this.props

    return (
      <div className={classNames(classes.container, className)} {...passProps}>
        <div className={classes.welcomeClouds}>
          <div className={classNames(classes.welcomeCloud, 'foreground')} />
          <div className={classNames(classes.welcomeCloud, 'background')} />
          <div className={classNames(classes.welcomeCloud, 'foreground')} />
          <div className={classNames(classes.welcomeCloud, 'background')} />
          <div className={classNames(classes.welcomeCloud, 'foreground')} />
          <div className={classNames(classes.welcomeCloud, 'background')} />
          <div className={classNames(classes.welcomeCloud, 'foreground')} />
          <div className={classNames(classes.welcomeCloud, 'background')} />
          <div className={classNames(classes.welcomeCloud, 'foreground')} />
          <div className={classNames(classes.welcomeCloud, 'background')} />
        </div>
        <div className={classes.contentContainer}>
          <div>
            <div className={classes.intro}>
              <img className={classes.introIcon} src='../../icons/app.svg' />
              <div>
                <Button
                  variant='raised'
                  size='large'
                  className={classes.addButton}
                  onClick={this.handleOpenAddWizard}>
                  <AddCircleIcon style={{ marginRight: 8 }} /> Add your first account
                </Button>
              </div>
              {!user.isLoggedIn ? (
                <Button className={classes.loginButton} onClick={this.handleLoginWavebox}>
                  Use your Wavebox membership on this machine
                </Button>
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Welcome
