import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton, FontIcon } from 'material-ui'
import styles from '../SettingStyles'
import { mailboxActions, ServiceReducer, mailboxDispatch } from 'stores/mailbox'
import { USER_SCRIPTS_WEB_URL } from 'shared/constants'
const { remote: { shell } } = window.nativeRequire('electron')

export default class AccountCustomCodeSettings extends React.Component {
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
    const { mailbox, service, onRequestEditCustomCode, ...passProps } = this.props

    return (
      <div {...passProps}>
        <div>
          <RaisedButton
            style={styles.buttonInline}
            label='Custom CSS'
            icon={<FontIcon className='material-icons'>code</FontIcon>}
            onTouchTap={() => {
              onRequestEditCustomCode('Custom CSS', service.customCSS, (code) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomCSS, code)
                mailboxDispatch.reload(mailbox.id, service.type)
              })
            }} />
          <RaisedButton
            style={styles.buttonInline}
            label='Custom JS'
            icon={<FontIcon className='material-icons'>code</FontIcon>}
            onTouchTap={() => {
              onRequestEditCustomCode('Custom JS', service.customJS, (code) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomJS, code)
                mailboxDispatch.reload(mailbox.id, service.type)
              })
            }} />
        </div>
        <div style={styles.button}>
          <a
            style={styles.userscriptLink}
            onClick={(evt) => { evt.preventDefault(); shell.openExternal(USER_SCRIPTS_WEB_URL) }}
            href={USER_SCRIPTS_WEB_URL}>Find custom userscripts</a>
        </div>
      </div>
    )
  }
}
