import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { FormControl, InputLabel, Select, MenuItem, Paper, ListItemIcon, ListItemText } from '@material-ui/core'
import lightBlue from '@material-ui/core/colors/lightBlue'
import AddBoxIcon from '@material-ui/icons/AddBox'

const styles = {
  accountPickerBanner: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    right: 0,
    height: 85,
    zIndex: 1,
    backgroundColor: lightBlue[50]
  },
  accountPicker: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  accountPickerAvatar: {
    position: 'absolute',
    top: 20,
    left: 20
  },
  accountPickerContainer: {
    position: 'absolute',
    top: 25,
    left: 100,
    right: 15
  },
  accountPickerLabel: {
    fontSize: 20,
    color: lightBlue[600],
    fontWeight: 'bold',
    marginTop: -5
  }
}

@withStyles(styles)
class AccountPickerBanner extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    selectedMailboxId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const mailboxIds = accountState.mailboxIds()
    return {
      mailboxIds: mailboxIds,
      mailboxDisplayNames: mailboxIds.map((mailboxId) => {
        return accountState.resolvedMailboxDisplayName(mailboxId)
      })
    }
  })()

  accountChanged = (accountState) => {
    const mailboxIds = accountState.mailboxIds()
    this.setState({
      mailboxIds: mailboxIds,
      mailboxDisplayNames: mailboxIds.map((mailboxId) => {
        return accountState.resolvedMailboxDisplayName(mailboxId)
      })
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleChange = (evt) => {
    if (evt.target.value === '__add__') {
      window.location.hash = '/mailbox_wizard/add'
    } else {
      this.props.onChange(evt.target.value)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes, className, selectedMailboxId, onChange, ...passProps } = this.props
    const { mailboxIds, mailboxDisplayNames } = this.state

    return (
      <Paper className={classNames(classes.accountPickerBanner, className)} {...passProps}>
        <div className={classes.accountPicker}>
          <MailboxAvatar
            mailboxId={selectedMailboxId || mailboxIds[0]}
            size={60}
            className={classes.accountPickerAvatar} />
          <div className={classes.accountPickerContainer}>
            <FormControl fullWidth>
              <InputLabel className={classes.accountPickerLabel}>Pick your account</InputLabel>
              <Select
                value={selectedMailboxId || mailboxIds[0]}
                fullWidth
                MenuProps={{
                  disableEnforceFocus: true,
                  MenuListProps: { dense: true },
                  PaperProps: {
                    style: { maxHeight: 200 }
                  }
                }}
                onChange={this.handleChange}>
                {mailboxIds.map((mailboxId, index) => {
                  return (
                    <MenuItem value={mailboxId} key={mailboxId}>
                      {mailboxDisplayNames[index]}
                    </MenuItem>
                  )
                })}
                <MenuItem value='__add__'>
                  <ListItemIcon className={classes.icon}>
                    <AddBoxIcon />
                  </ListItemIcon>
                  <ListItemText inset primary='Add another Account' />
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </Paper>
    )
  }
}

export default AccountPickerBanner
