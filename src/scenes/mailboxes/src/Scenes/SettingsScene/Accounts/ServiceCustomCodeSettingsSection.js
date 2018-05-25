import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, ServiceReducer, mailboxDispatch } from 'stores/mailbox'
import { USER_SCRIPTS_WEB_URL } from 'shared/constants'
import electron from 'electron'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import CodeIcon from '@material-ui/icons/Code'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

const styles = {
  userscriptLink: {
    color: blue[700],
    fontSize: '75%'
  }
}

@withStyles(styles)
class ServiceCustomCodeSettingsSection extends React.Component {
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
    return (
      modelCompare(this.props.mailbox, nextProps.mailbox, ['id']) ||
      modelCompare(this.props.service, nextProps.service, ['type', 'sleepable', 'customCSS', 'customJS']) ||
      partialShallowCompare(
        { onRequestEditCustomCode: this.props.onRequestEditCustomCode },
        this.state,
        { onRequestEditCustomCode: nextProps.onRequestEditCustomCode },
        nextState
      )
    )
  }

  render () {
    const { mailbox, service, onRequestEditCustomCode, classes, ...passProps } = this.props

    return (
      <SettingsListSection title='Custom Code & Userscripts' icon={<CodeIcon />} {...passProps}>
        <SettingsListItemButton
          label='Custom CSS'
          icon={<CodeIcon />}
          onClick={() => {
            onRequestEditCustomCode('Custom CSS', service.customCSS, (code) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomCSS, code)
              mailboxDispatch.reload(mailbox.id, service.type)
            })
          }} />
        <SettingsListItemButton
          label='Custom JS'
          icon={<CodeIcon />}
          onClick={() => {
            onRequestEditCustomCode('Custom JS', service.customJS, (code) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomJS, code)
              mailboxDispatch.reload(mailbox.id, service.type)
            })
          }} />
        <SettingsListItem divider={false}>
          <a
            className={classes.userscriptLink}
            onClick={(evt) => { evt.preventDefault(); electron.remote.shell.openExternal(USER_SCRIPTS_WEB_URL) }}
            href={USER_SCRIPTS_WEB_URL}>Find custom userscripts</a>
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}

export default ServiceCustomCodeSettingsSection
