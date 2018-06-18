import React from 'react'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const CLOUD_ANIMATION_DURATION = 120

const styles = {
  root: {
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
      top: '87%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_365.png')}")`
    },
    '&:nth-child(2)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 2}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 16}s`,
      top: '10%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_evernote.png')}")`
    },
    '&:nth-child(3)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 3}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 24}s`,
      top: '95%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_facebook.png')}")`
    },
    '&:nth-child(4)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 4}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 32}s`,
      top: '91%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_github.png')}")`
    },
    '&:nth-child(5)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 5}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 40}s`,
      top: '80%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_gmail.png')}")`
    },
    '&:nth-child(6)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 6}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 48}s`,
      top: '80%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_mail.png')}")`
    },
    '&:nth-child(7)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 7}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 56}s`,
      top: '15%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_mailchimp.png')}")`
    },
    '&:nth-child(8)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 8}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 64}s`,
      top: '14%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_salesforce.png')}")`
    },
    '&:nth-child(9)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 9}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 72}s`,
      top: '8%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_slack.png')}")`
    },
    '&:nth-child(10)': {
      animationDelay: `${((CLOUD_ANIMATION_DURATION / 6.5) * -1) * 10}s`,
      animationDuration: `${CLOUD_ANIMATION_DURATION - 80}s`,
      top: '2%',
      backgroundImage: `url("${Resolver.image('clouds/cloud_trello.png')}")`
    }
  }
}

@withStyles(styles)
class WelcomeBackground extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, classes, ...passProps } = this.props

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
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
    )
  }
}

export default WelcomeBackground
