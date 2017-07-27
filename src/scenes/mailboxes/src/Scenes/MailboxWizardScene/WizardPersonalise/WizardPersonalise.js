import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxTypes from 'shared/Models/Accounts/MailboxTypes'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import MicrosoftMailbox from 'shared/Models/Accounts/Microsoft/MicrosoftMailbox'
import WizardColorPicker from './WizardColorPicker'
import WizardServicePicker from './WizardServicePicker'
import { FlatButton, RaisedButton } from 'material-ui'
import { mailboxActions } from 'stores/mailbox'

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 68,
    padding: 16,
    overflowX: 'hidden',
    overflowY: 'auto'
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    padding: 16,
    textAlign: 'right'
  },

  // Typography
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  },

  // Elements
  colorPicker: {
    display: 'inline-block',
    maxWidth: '100%'
  },

  // Footer
  cancelButton: {
    marginRight: 8
  }
}

export default class WizardPersonalise extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    MailboxClass: PropTypes.func.isRequired,
    accessMode: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (nextProps.MailboxClass !== this.props.MailboxClass || nextProps.accessMode !== this.props.accessMode) {
      this.setState({
        color: this.getDefaultMailboxColor(nextProps.MailboxClass, nextProps.accessMode),
        enabledServices: nextProps.MailboxClass.defaultServiceTypes,
        servicesDisplayMode: CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    color: this.getDefaultMailboxColor(this.props.MailboxClass, this.props.accessMode),
    enabledServices: this.props.MailboxClass.defaultServiceTypes,
    servicesDisplayMode: CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user pressing next
  */
  handleNext = () => {
    const { MailboxClass, accessMode } = this.props
    const { enabledServices, servicesDisplayMode, color } = this.state
    const mailboxJS = this.createJS(MailboxClass, accessMode, enabledServices, servicesDisplayMode, color)
    mailboxActions.authenticateMailbox(MailboxClass, accessMode, mailboxJS)
  }

  /* **************************************************************************/
  // Data getters
  /* **************************************************************************/

  /**
  * Creates the JS for the mailbox
  * @param MailboxClass: the class for the mailbox
  * @param accessMode: the access mode for the mailbox
  * @param enabledServices: the enabled services
  * @param servicesDisplayMode: display mode for the services
  * @param color: the mailbox color
  * @return the vanilla js object to create the model
  */
  createJS (MailboxClass, accessMode, enabledServices, servicesDisplayMode, color) {
    if (MailboxClass.type === MailboxTypes.GOOGLE) {
      return MailboxClass.createJS(undefined, accessMode, enabledServices, servicesDisplayMode, color)
    } else if (MailboxClass.type === MailboxTypes.MICROSOFT) {
      return MailboxClass.createJS(undefined, accessMode, enabledServices, servicesDisplayMode, color)
    } else {
      return MailboxClass.createJS(undefined, enabledServices, servicesDisplayMode, color)
    }
  }

  /**
  * Gets the default color for this mailbox type
  * @param MailboxClass: the class for the mailbox
  * @param accessMode: the mode that will be used to access the service
  * @return a default colour for this mailbox
  */
  getDefaultMailboxColor (MailboxClass, accessMode) {
    if (MailboxClass.type === MailboxTypes.GOOGLE) {
      if (accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
        return MailboxClass.defaultColorGmail
      } else if (accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
        return MailboxClass.defaultColorGinbox
      }
    } else if (MailboxClass.type === MailboxTypes.MICROSOFT) {
      if (accessMode === MicrosoftMailbox.ACCESS_MODES.OUTLOOK) {
        return MailboxClass.defaultColorOutlook
      } else if (accessMode === MicrosoftMailbox.ACCESS_MODES.OFFICE365) {
        return MailboxClass.defaultColorOffice365
      }
    } else {
      return MailboxClass.defaultColor
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { MailboxClass, accessMode, onRequestCancel, style, ...passProps } = this.props
    const { color, enabledServices, servicesDisplayMode } = this.state

    return (
      <div {...passProps} style={{ ...styles.container, ...style }}>
        <div style={styles.body} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
          <div>
            <h2 style={styles.heading}>Pick a Colour</h2>
            <p style={styles.subHeading}>Get started by picking a colour for your account</p>
            <WizardColorPicker
              style={styles.colorPicker}
              MailboxClass={MailboxClass}
              accessMode={accessMode}
              mailboxDefaultColor={this.getDefaultMailboxColor(MailboxClass, accessMode)}
              selectedColor={color}
              onColorPicked={(color) => this.setState({ color: color })} />
          </div>
          {MailboxClass.supportsAdditionalServiceTypes ? (
            <div>
              <h2 style={styles.heading}>Choose your services</h2>
              <p style={styles.subHeading}>Pick which other services you'd like to use alongside your account</p>
              <WizardServicePicker
                MailboxClass={MailboxClass}
                enabledServices={enabledServices}
                onServicesChanged={(nextServices) => this.setState({ enabledServices: nextServices })}
                servicesDisplayMode={servicesDisplayMode}
                onServicesDisplayModeChanged={(mode) => this.setState({ servicesDisplayMode: mode })} />
            </div>
          ) : undefined}
        </div>
        <div style={styles.footer}>
          <FlatButton
            style={styles.cancelButton}
            onTouchTap={onRequestCancel}
            label='Cancel' />
          <RaisedButton
            primary
            onTouchTap={this.handleNext}
            label='Next' />
        </div>
      </div>
    )
  }
}
