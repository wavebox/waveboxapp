const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { RaisedButton, FontIcon } = require('material-ui')
const styles = require('../SettingStyles')
const { mailboxActions, ServiceReducer, mailboxDispatch } = require('stores/mailbox')
const { USER_SCRIPTS_WEB_URL } = require('shared/constants')
const { remote: { shell } } = window.nativeRequire('electron')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountCustomCodeSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    service: React.PropTypes.object.isRequired,
    onRequestEditCustomCode: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

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
})
