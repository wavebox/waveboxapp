import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Container, Row, Col } from 'Components/Grid'
import InstalledExtensionList from './InstalledExtensionList'
import AvailableExtensionList from './AvailableExtensionList'
import UpgradeExtensionList from './UpgradeExtensionList'

export default class ExtensionList extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {showRestart, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={12}>
              <InstalledExtensionList showRestart={showRestart} />
              <AvailableExtensionList showRestart={showRestart} />
              <UpgradeExtensionList showRestart={showRestart} />
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
