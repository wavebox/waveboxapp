import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import MailboxServiceTooltip from 'wbui/MailboxServiceTooltip'
import SidelistItemMailboxBadge from './SidelistItemMailboxBadge'
import MailboxAvatar from 'wbui/MailboxAvatar'
import uuid from 'uuid'
import UISettings from 'shared/Models/Settings/UISettings'
import Color from 'color'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'

const styles = {
  /**
  * Avatar
  */
  avatar: {
    display: 'block',
    transform: 'translate3d(0,0,0)', // fix for wavebox/waveboxapp#619
    margin: '4px auto',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',

    '&.is-sleeping': {
      filter: 'grayscale(100%)'
    }
  },

  /**
  * Badge
  */
  badge: {
    position: 'absolute',
    height: 24,
    minWidth: 24,
    fontSize: '13px',
    borderRadius: 12,
    lineHeight: '24px',
    top: -6,
    right: 4,
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 4,
    paddingRight: 4
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 16
  },
  badgeContainer: {
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 0,
    paddingRight: 0,
    display: 'block',
    cursor: 'pointer'
  },

  /**
  * Active
  */
  activeIndicator: {
    position: 'absolute',
    left: 2,
    top: 25,
    width: 6,
    height: 6,
    marginTop: -3,
    borderRadius: '50%',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  }
}

@withStyles(styles)
class SidelistItemMalboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
  }

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateAccountState(nextProps))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      ...this.generateAccountState(),
      isHovering: false,
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

  generateAccountState (props = this.props, accountState = accountStore.getState()) {
    const { mailboxId } = props
    const mailbox = accountState.getMailbox(mailboxId)
    const singleServiceId = (mailbox || {}).singleService
    const singleService = accountState.getService(singleServiceId)
    const singleServiceIsRestricted = accountState.isServiceRestricted(singleServiceId)

    return {
      mailbox: mailbox,
      singleService: singleService,
      singleServiceIsRestricted: singleServiceIsRestricted,
      avatar: accountState.getMailboxAvatarConfig(mailboxId),
      showActiveIndicator: accountState.activeMailboxId() === mailboxId,
      isMailboxActive: accountState.activeMailboxId() === mailboxId,
      isAllServicesSleeping: accountState.isMailboxSleeping(mailboxId)
    }
  }

  accountChanged = (accountState) => {
    this.setState({
      ...this.generateAccountState(this.props, accountState)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      isHovering,
      isMailboxActive,
      isAllServicesSleeping,
      mailbox,
      singleService,
      singleServiceIsRestricted,
      avatar,
      globalShowSleepableServiceIndicator,
      showActiveIndicator,
      tooltipsEnabled
    } = this.state
    if (!mailbox) { return false }
    const showSleeping = (
      isAllServicesSleeping &&
      mailbox.showSleepableServiceIndicator &&
      globalShowSleepableServiceIndicator
    )

    const borderColor = isMailboxActive || isHovering ? (
      mailbox.color
    ) : (
      Color(mailbox.color).lighten(0.4).rgb().string()
    )

    return (
      <SidelistItemMailboxBadge
        {...passProps}
        id={`ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`}
        isAuthInvalid={mailbox.isAuthenticationInvalid || !mailbox.hasAuth}
        mailboxId={mailbox.id}
        displayMailboxOverview={mailbox.hasMultipleServices}
        badgeClassName={classes.badge}
        className={classNames(classes.badgeContainer, className)}
        iconClassName={classes.badgeFAIcon}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}>
        {showActiveIndicator ? (
          <div className={classes.activeIndicator} style={{ backgroundColor: mailbox.color }} />
        ) : undefined}
        <MailboxAvatar
          avatar={avatar}
          size={42}
          resolver={(i) => Resolver.image(i)}
          className={classNames(classes.avatar, showSleeping ? 'is-sleeping' : undefined)}
          style={{ boxShadow: mailbox.showAvatarColorRing ? `0 0 0 4px ${borderColor}` : 'none' }} />
        {tooltipsEnabled && singleService ? (
          <MailboxServiceTooltip
            mailbox={mailbox}
            service={singleService}
            isRestricted={singleServiceIsRestricted}
            active={isHovering}
            tooltipTimeout={0}
            position='right'
            arrow='center'
            group={this.instanceId}
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`} />
        ) : undefined}
      </SidelistItemMailboxBadge>
    )
  }
}

export default SidelistItemMalboxAvatar
