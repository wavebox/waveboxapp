import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import { userStore } from 'stores/user'
import { IconButton, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import uuid from 'uuid'
import ReactPortalTooltip from 'react-portal-tooltip'
import User from 'shared/Models/User'

const UPDATE_INTERVAL = 1000 * 60 * 15 // 15 minutes
const styles = {
  /**
  * Layout
  */
  button: {
    position: 'relative',
    width: 70,
    height: 60,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  compositeIconContainer: {
    position: 'absolute',
    top: 6,
    left: 12,
    bottom: 6,
    right: 12
  },
  icon: {
    fontSize: '44px',
    marginLeft: -5
  },
  remainingText: {
    position: 'absolute',
    top: 17,
    left: 6,
    right: 6,
    height: 24,
    lineHeight: '24px',
    color: 'white'
  },
  remainingText2Char: {
    fontSize: '20px'
  },
  remainingText3Char: {
    fontSize: '16px'
  },

  /**
  * Popover layout
  */
  popover: {
    style: {
      background: Colors.lightBlue400,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: '13px',
      color: 'white',
      cursor: 'pointer'
    },
    arrowStyle: {
      color: Colors.lightBlue400,
      borderColor: false
    }
  },

  /**
  * Popover content
  */
  popoverContentContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  popoverMoreButton: {
    marginLeft: 32,
    alignSelf: 'center',
    border: '1px solid white',
    padding: '8px 16px',
    borderRadius: 4,
    fontSize: '11px'
  }
}

export default class SidelistUpgradePlans extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    this.updateInterval = setInterval(() => {
      this.setState({
        expiresInDays: userStore.getState().user.sidebarPlanExpiryDays
      })
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    clearInterval(this.updateInterval)
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      generatedId: uuid.v4(),
      buttonHover: false,
      tooltipHover: false,
      expiresInDays: userState.user.sidebarPlanExpiryDays,
      currentPlan: userState.user.plan
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      expiresInDays: userState.user.sidebarPlanExpiryDays,
      currentPlan: userState.user.plan
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Starts the user on the upgrade process
  */
  handleUpgrade = () => {
    this.setState({
      tooltipHover: false,
      buttonHover: false
    })
    window.location.hash = '/pro'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Calculates the days until expiry as a humanized string
  * @param days: the days until the plan expires
  * @return the days until expiry in the format 00 or 99+
  */
  formatRemainingDays (days) {
    if (days <= 0) {
      return '00'
    } else if (days < 10) {
      return '0' + days
    } else if (days <= 99) {
      return `${days}`
    } else {
      return '99+'
    }
  }

  /**
  * Generates content for the popup
  * @param currentPlan: the current plan that the user is
  * @param expiryDays: the days until the plan has expired
  * @return jsx
  */
  generatePopupContent (currentPlan, expiryDays) {
    let text
    //TODO check this text
    if (currentPlan === User.PLANS.FREE) {
      text = ['Enjoy the best of Wavebox. Upgrade now!']
    } else if (currentPlan === User.PLANS.TRIAL) {
      if (expiryDays < 0) {
        text = [
          'Your trial has expired.',
          'Enjoy the best of Wavebox by upgrading now!'
        ]
      } else if (expiryDays === 0) {
        text = [
          'Your trial is about to expire.',
          'Upgrade now to continue enjoying the best of Wavebox'
        ]
      } else {
        text = [
          `Your trial will expire in ${expiryDays} days.`,
          'Upgrade to enjoy the best of Wavebox'
        ]
      }
    } else if (currentPlan === User.PLANS.PRO) {
      if (expiryDays < 0) {
        text = [
          'Your Pro membership has expired.',
          'Enjoy the best of Wavebox by upgrading now!'
        ]
      } else if (expiryDays === 0) {
        text = [
          'Your Pro membership is about to expire.',
          'Renew now to continue enjoying the best of Wavebox'
        ]
      } else {
        text = [
          `Your Pro membership will expire in ${expiryDays} days.`,
          'Renew to enjoy the best of Wavebox'
        ]
      }
    } else {
      text = [
        'Enjoy the best of Wavebox. Upgrade now!'
      ]
    }

    return (
      <div style={styles.popoverContentContainer} onClick={this.handleUpgrade}>
        <div>
          {text.map((t, i) => (<p key={i}>{t}</p>))}
        </div>
        <div style={styles.popoverMoreButton}>
          Find out more
        </div>
      </div>
    )
  }

  render () {
    const { style, ...passProps } = this.props
    const { expiresInDays, currentPlan, generatedId, buttonHover, tooltipHover } = this.state
    const formattedDays = this.formatRemainingDays(expiresInDays)

    return (
      <div
        {...passProps}
        style={{...style}}
        onMouseEnter={() => this.setState({ buttonHover: true })}
        onMouseLeave={() => this.setState({ buttonHover: false })}
        id={`ReactComponent-Sidelist-Item-${generatedId}`}>
        <IconButton
          onClick={this.handleUpgrade}
          style={styles.button}
          iconStyle={styles.compositeIconContainer}>
          <div>
            <FontIcon
              style={styles.icon}
              className='fa fa-fw fa-calendar-o'
              color={buttonHover ? Colors.lightBlue200 : Colors.lightBlue400} />
            <div style={{...styles.remainingText, ...(formattedDays.length === 2 ? styles.remainingText2Char : styles.remainingText3Char)}}>
              {formattedDays}
            </div>
          </div>
        </IconButton>
        <ReactPortalTooltip
          active={buttonHover || tooltipHover}
          tooltipTimeout={250}
          style={styles.popover}
          position='right'
          onMouseEnter={() => this.setState({ tooltipHover: true })}
          onMouseLeave={() => this.setState({ tooltipHover: false })}
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Item-${generatedId}`}>
          {this.generatePopupContent(currentPlan, expiresInDays)}
        </ReactPortalTooltip>
      </div>
    )
  }
}
