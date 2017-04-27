import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountServiceItem from '../AccountServiceItem'
import { Row, Col } from 'Components/Grid'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountSleepableSettings from '../AccountSleepableSettings'

export default class GoogleServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    serviceType: PropTypes.string.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, serviceType, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(serviceType)

    return (
      <AccountServiceItem {...passProps} mailbox={mailbox} serviceType={serviceType}>
        {service ? (
          <Row>
            <Col md={6}>
              <AccountSleepableSettings mailbox={mailbox} service={service} />
              <br />
              <AccountCustomCodeSettings
                mailbox={mailbox}
                service={service}
                onRequestEditCustomCode={onRequestEditCustomCode} />
            </Col>
          </Row>
        ) : undefined}
      </AccountServiceItem>
    )
  }
}
