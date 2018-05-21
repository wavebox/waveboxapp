import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import SettingsListButton from 'wbui/SettingsListButton'
import { Icon } from '@material-ui/core'
// import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
// import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'

const SERVICE_STATE_KEYS = [
  'customUnreadQuery',
  'customUnreadLabelWatchString',
  'customUnreadCountFromLabel',
  'customUnreadCountLabel',
  'customUnreadCountLabelField'
]
const KB_ARTICLE_URL = 'https://wavebox.io/kb/custom-google-unread-counts'

export default class GoogleCustomUnreadSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState(this.generateState(nextProps.service))
    } else {
      this.setState(this.generateStateUpdate(this.props.service, nextProps.service))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state for the component
  * @param service: the service to generate for
  * @return the state
  */
  generateState (service) {
    return {
      ...(SERVICE_STATE_KEYS.reduce((acc, k) => {
        acc[k] = service[k]
        return acc
      }, {})),
      showCustomUnreadSettings: service.hasCustomUnreadQuery || service.hasCustomUnreadLabelWatch
    }
  }

  /**
  * Generates the state update between two services
  * @param prevService: the previous service
  * @param nextService: the next service
  * @return a state update
  */
  generateStateUpdate (prevService, nextService) {
    return SERVICE_STATE_KEYS.reduce((acc, k) => {
      if (prevService[k] !== nextService[k]) {
        acc[k] = nextService[k]
      }
      return acc
    }, {})
  }

  state = this.generateState(this.props.service)

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the help kb article
  * @param evt: the event that fired
  */
  handleOpenKBArticle = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal(KB_ARTICLE_URL)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailbox,
      service,
      style,
      ...passProps
    } = this.props
    const {
      // customUnreadQuery,
      // customUnreadLabelWatchString,
      // customUnreadCountFromLabel,
      // customUnreadCountLabel,
      // customUnreadCountLabelField,
      showCustomUnreadSettings
    } = this.state
    // const hasCustomQueryConfiguration = !!customUnreadQuery || !!customUnreadLabelWatchString

    if (showCustomUnreadSettings) {
      return false
      /* return (
        <Paper style={{...styles.paper, ...style}} {...passProps}>
          <h1 style={styles.subheading}>Advanced Unread Options</h1>
          <div style={styles.link} onClick={this.handleOpenKBArticle}>
            <small>Knowledge Base</small>
          </div>
          <TextField
            key={`customUnreadQuery_${mailbox.id}`}
            id={`customUnreadQuery_${mailbox.id}`}
            value={customUnreadQuery}
            fullWidth
            floatingLabelText='Custom Unread Query'
            hintText='label:inbox label:unread'
            errorText={hasCustomQueryConfiguration && !customUnreadQuery ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
            onChange={(evt) => this.setState({ customUnreadQuery: evt.target.value })}
            onBlur={(evt) => {
              mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadQuery, customUnreadQuery)
            }} />
          <TextField
            key={`customUnreadWatchLabels_${mailbox.id}`}
            id={`customUnreadWatchLabels_${mailbox.id}`}
            value={customUnreadLabelWatchString}
            fullWidth
            floatingLabelText='Custom Unread Watch Labels (Comma seperated)'
            hintText='INBOX, UNREAD'
            errorText={hasCustomQueryConfiguration && !customUnreadLabelWatchString ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
            onChange={(evt) => this.setState({ customUnreadLabelWatchString: evt.target.value })}
            onBlur={(evt) => {
              mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadLabelWatchString, customUnreadLabelWatchString)
            }} />
          <Checkbox
            checked={customUnreadCountFromLabel}
            label='Take unread count from single label'
            onCheck={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountFromLabel, toggled)
            }} />
          <TextField
            key={`customUnreadCountLabel_${mailbox.id}`}
            id={`customUnreadCountLabel_${mailbox.id}`}
            value={customUnreadCountLabel}
            fullWidth
            disabled={!customUnreadCountFromLabel}
            floatingLabelText='Custom count label'
            hintText='INBOX'
            errorText={customUnreadCountFromLabel && !customUnreadCountLabel ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
            onChange={(evt) => this.setState({ customUnreadCountLabel: evt.target.value })}
            onBlur={(evt) => {
              mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountLabel, customUnreadCountLabel)
            }} />
          <SelectField
            floatingLabelText='Custom count label field'
            value={customUnreadCountLabelField}
            disabled={!customUnreadCountFromLabel}
            floatingLabelFixed
            fullWidth
            onChange={(evt, index, value) => {
              mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountLabelField, value)
            }}>
            {GoogleDefaultService.CUSTOM_UNREAD_COUNT_LABEL_FIELDS.map((fieldName) => {
              return (
                <MenuItem key={fieldName} value={fieldName} primaryText={fieldName} />
              )
            })}
          </SelectField>
        </Paper>
      ) */
    } else {
      return (
        <div {...passProps}>
          <SettingsListButton
            label='Advanced Unread Options'
            icon={<Icon className='fas fa-fw fa-wrench' />}
            onClick={() => this.setState({ showCustomUnreadSettings: true })}
            secondary='These can be used to configure Wavebox to provide Notifications and Badges for a custom set of messages'
          />
        </div>
      )
    }
  }
}
