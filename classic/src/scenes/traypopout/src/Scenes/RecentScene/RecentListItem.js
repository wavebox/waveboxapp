import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItem, ListItemText } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import classNames from 'classnames'
import grey from '@material-ui/core/colors/grey'

const styles = {
  root: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottom: '1px solid rgb(224, 224, 224)'
  },
  primaryText: {
    fontSize: 14,
    lineHeight: '16px',
    height: 16,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  secondaryText: {
    height: 'auto'
  },
  serviceName: {
    fontSize: 13,
    lineHeight: '15px',
    height: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: grey[500]
  },
  url: {
    fontSize: 11,
    lineHeight: '15px',
    height: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: grey[500]
  },
  favicon: {
    minHeight: 40,
    height: 40,
    minWidth: 40,
    width: 40,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
}

@withStyles(styles)
class RecentListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    recentItem: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.recentItem.serviceId !== nextProps.recentItem.serviceId) {
      this.setState(this.generateAccountState(nextProps.recentItem.serviceId))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateAccountState(this.props.recentItem.serviceId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateAccountState(this.props.recentItem.serviceId, accountState))
  }

  /**
  * Generates the mailbox state
  * @param mailboxId: the id of the mailbox
  * @param accountState=autoget: the current store state
  * @return the mailbox state
  */
  generateAccountState (serviceId, accountState = accountStore.getState()) {
    const service = accountState.getService(serviceId)
    return service ? {
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(service.parentId)
      ),
      humanizedServiceTypeShort: service.humanizedTypeShort,
      humanizedServiceType: service.humanizedType
    } : {
      displayName: 'Untitled',
      humanizedServiceTypeShort: 'Untitled',
      humanizedServiceType: 'Untitled'
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClick = (evt) => {
    if (this.props.onClick) {
      this.props.onClick(evt, this.props.recentItem)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      recentItem,
      className,
      onClick,
      ...passProps
    } = this.props
    const {
      displayName,
      humanizedServiceTypeShort,
      humanizedServiceType
    } = this.state

    return (
      <ListItem
        button
        onClick={this.handleClick}
        className={classNames(classes.root, className)}
        {...passProps}>
        <div
          className={classes.favicon}
          style={(recentItem.favicons && recentItem.favicons.length
            ? { backgroundImage: `url("${recentItem.favicons.slice(-1)[0]}")` }
            : undefined)} />
        <ListItemText
          primary={(<div className={classes.primaryText}>{recentItem.title}</div>)}
          disableTypography
          secondary={(
            <div className={classes.secondaryText}>
              <div className={classes.serviceName}>
                {displayName === humanizedServiceTypeShort || displayName === humanizedServiceType
                  ? displayName
                  : `${humanizedServiceTypeShort} : ${displayName}`}
              </div>
              <div className={classes.url}>
                {recentItem.url}
              </div>
            </div>
          )} />
      </ListItem>
    )
  }
}

export default RecentListItem
