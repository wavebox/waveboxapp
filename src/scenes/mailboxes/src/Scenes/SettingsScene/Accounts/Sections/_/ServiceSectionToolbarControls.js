import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import { Tooltip, IconButton } from '@material-ui/core'
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

// This has been split out into its own control because the performance of re-rendering
// Tooltip in material-ui:1.0.0 is terrible. @Thomas101 refactor this when performance returns
class ServiceSectionToolbarControls extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    // Keep props primitive so we can prevent updates.
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    isSingleService: PropTypes.bool.isRequired,
    isDefaultService: PropTypes.bool.isRequired,
    isServiceEnabled: PropTypes.bool.isRequired,
    isFirstService: PropTypes.bool.isRequired,
    isLastService: PropTypes.bool.isRequired
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
      serviceType,
      isSingleService,
      isDefaultService,
      isServiceEnabled,
      isFirstService,
      isLastService,
      ...passProps
    } = this.props

    // See note about performance at top of file
    if (!isSingleService && !isDefaultService) {
      return (
        <div {...passProps}>
          {isServiceEnabled ? (
            <Tooltip title='Disable'>
              <div>
                <IconButton
                  disabled={isDefaultService}
                  onClick={() => mailboxActions.reduce(mailboxId, MailboxReducer.removeService, serviceType)}>
                  <CheckBoxIcon />
                </IconButton>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title='Enable'>
              <div>
                <IconButton onClick={() => mailboxActions.reduce(mailboxId, MailboxReducer.addService, serviceType)}>
                  <CheckBoxOutlineIcon />
                </IconButton>
              </div>
            </Tooltip>
          )}
          {isServiceEnabled ? (
            <Tooltip title='Move up'>
              <div>
                <IconButton
                  disabled={isFirstService}
                  onChange={() => mailboxActions.reduce(mailboxId, MailboxReducer.moveServiceUp, serviceType)}>
                  <ArrowUpwardIcon />
                </IconButton>
              </div>
            </Tooltip>
          ) : undefined}
          {isServiceEnabled ? (
            <Tooltip title='Move down'>
              <div>
                <IconButton
                  disabled={isLastService}
                  onChange={() => mailboxActions.reduce(mailboxId, MailboxReducer.moveServiceDown, serviceType)}>
                  <ArrowDownwardIcon />
                </IconButton>
              </div>
            </Tooltip>
          ) : undefined}
        </div>
      )
    } else {
      return (<div {...passProps} />)
    }
  }
}

export default ServiceSectionToolbarControls
