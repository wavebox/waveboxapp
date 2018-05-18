import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItemText } from '@material-ui/core'
import { mailboxActions, ServiceReducer, mailboxDispatch } from 'stores/mailbox'
import { USER_SCRIPTS_WEB_URL } from 'shared/constants'
import electron from 'electron'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListButton from 'wbui/SettingsListButton'
import CodeIcon from '@material-ui/icons/Code'

const styles = {
  userscriptLink: {
    color: blue[700],
    fontSize: '85%',
    marginBottom: 10
  }
}

@withStyles(styles)
class AccountCustomCodeSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, service, onRequestEditCustomCode, classes, ...passProps } = this.props

    return (
      <SettingsListSection title='Custom Code & Userscripts' {...passProps}>
        <SettingsListButton
          label='Custom CSS'
          IconClass={CodeIcon}
          onClick={() => {
            onRequestEditCustomCode('Custom CSS', service.customCSS, (code) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomCSS, code)
              mailboxDispatch.reload(mailbox.id, service.type)
            })
          }} />
        <SettingsListButton
          label='Custom JS'
          IconClass={CodeIcon}
          onClick={() => {
            onRequestEditCustomCode('Custom JS', service.customJS, (code) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomJS, code)
              mailboxDispatch.reload(mailbox.id, service.type)
            })
          }} />
        <SettingsListItem>
          <ListItemText primary={(
            <a
              className={classes.userscriptLink}
              onClick={(evt) => { evt.preventDefault(); electron.remote.shell.openExternal(USER_SCRIPTS_WEB_URL) }}
              href={USER_SCRIPTS_WEB_URL}>Find custom userscripts</a>
          )} />
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}

export default AccountCustomCodeSettings
