import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { accountStore } from 'stores/account'
import classNames from 'classnames'
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp'
import MailboxTooltipServiceItem from './MailboxTooltipServiceItem'
import MailboxTooltipServiceAddItem from './MailboxTooltipServiceAddItem'
import TooltipHeading from 'wbui/TooltipHeading'
import TooltipSectionList from 'wbui/TooltipSectionList'

const styles = (theme) => ({
  root: {
    overflow: 'hidden'
  },
  heading: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  services: {
    maxHeight: '100%'
  }
})

@withStyles(styles, { withTheme: true })
class MailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired,
    onOpenSettings: PropTypes.func.isRequired,
    onAddService: PropTypes.func.isRequired
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
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateMailboxState(nextProps.mailboxId))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateMailboxState(this.props.mailboxId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateMailboxState(this.props.mailboxId, accountState))
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param accountState=autoget: the current account state
  * @return state object
  */
  generateMailboxState (mailboxId, accountState = accountStore.getState()) {
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      displayName: accountState.resolvedMailboxDisplayName(mailboxId),
      serviceIds: mailbox ? mailbox.allServices : []
    }
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  handleSuppressContextMenu = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
  }

  handleOpenSettings = (evt) => {
    this.props.onOpenSettings(evt, this.props.mailboxId)
  }

  handleAddService = (evt) => {
    this.props.onAddService(evt, this.props.mailboxId)
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
      theme,
      className,
      onContextMenu,
      onOpenService,
      onOpenSettings,
      onAddService,
      ...passProps
    } = this.props
    const {
      displayName,
      serviceIds
    } = this.state

    return (
      <div
        className={classNames(className, classes.root)}
        onContextMenu={this.handleSuppressContextMenu}
        {...passProps}>
        <TooltipHeading
          primary={displayName}
          className={classes.heading}
          actionIcon={<SettingsSharpIcon />}
          onActionClick={this.handleOpenSettings} />
        {serviceIds.length > 1 ? (
          <TooltipSectionList style={{ maxHeight: window.outerHeight - 150 }} className={classes.services}>
            {serviceIds.map((serviceId) => (
              <MailboxTooltipServiceItem
                key={serviceId}
                mailboxId={mailboxId}
                serviceId={serviceId}
                onOpenService={onOpenService} />
            ))}
            <MailboxTooltipServiceAddItem onClick={this.handleAddService} />
          </TooltipSectionList>
        ) : undefined}
      </div>
    )
  }
}

export default MailboxTooltip
