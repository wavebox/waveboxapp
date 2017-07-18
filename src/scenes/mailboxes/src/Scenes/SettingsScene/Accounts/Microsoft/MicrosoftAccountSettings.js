import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'Components/Grid'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import AccountServicesHeading from '../AccountServicesHeading'
import AccountServicesSettings from '../AccountServicesSettings'
import MicrosoftServiceSettings from './MicrosoftServiceSettings'
import MicrosoftDefaultServiceSettings from './MicrosoftDefaultServiceSettings'
import { userStore } from 'stores/user'
import CoreService from 'shared/Models/Accounts/CoreService'

export default class MicrosoftAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      userHasServices: userStore.getState().user.hasServices
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the service type
  * @param mailbox: the current mailbox
  * @param serviceType: the type of service we are rendering for
  * @param onRequestEditCustomCode: the function call to open the edit custom code modal
  * @return jsx
  */
  renderServiceType (mailbox, serviceType, onRequestEditCustomCode) {
    switch (serviceType) {
      case CoreService.SERVICE_TYPES.DEFAULT:
        return (
          <MicrosoftDefaultServiceSettings
            key={serviceType}
            mailbox={mailbox}
            onRequestEditCustomCode={onRequestEditCustomCode} />)
      default:
        return (
          <MicrosoftServiceSettings
            key={serviceType}
            mailbox={mailbox}
            serviceType={serviceType}
            onRequestEditCustomCode={onRequestEditCustomCode} />)
    }
  }

  render () {
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const { userHasServices } = this.state

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <AccountAppearanceSettings mailbox={mailbox} />
            <AccountBadgeSettings mailbox={mailbox} />
            <AccountNotificationSettings mailbox={mailbox} />
          </Col>
          <Col md={6}>
            <AccountAdvancedSettings mailbox={mailbox} showRestart={showRestart} />
            <AccountServicesSettings mailbox={mailbox} />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <AccountServicesHeading mailbox={mailbox} />
          </Col>
        </Row>
        {userHasServices ? (
          <div>
            {mailbox.enabledServiceTypes.map((serviceType) => {
              return this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode)
            })}
            {mailbox.disabledServiceTypes.map((serviceType) => {
              return this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode)
            })}
          </div>
        ) : (
          <div>
            {this.renderServiceType(mailbox, CoreService.SERVICE_TYPES.DEFAULT, onRequestEditCustomCode)}
          </div>
        )}
      </div>
    )
  }
}
