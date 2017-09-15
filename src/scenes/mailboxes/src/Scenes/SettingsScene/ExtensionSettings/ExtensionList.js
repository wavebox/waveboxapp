import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../CommonSettingStyles'
import { Container, Row, Col } from 'Components/Grid'
import ExtensionListItem from './ExtensionListItem'
import extensions from 'shared/extensionStore'
import { crextensionStore } from 'stores/crextension'

export default class ExtensionList extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    crextensionStore.listen(this.extensionUpdated)
  }

  componentWillUnmount () {
    crextensionStore.unlisten(this.extensionUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      installedManifestList: crextensionStore.getState().manifestList()
    }
  })()

  extensionUpdated = (crextensionState) => {
    this.setState({
      installedManifestList: crextensionStore.getState().manifestList()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {showRestart, ...passProps} = this.props
    const { installedManifestList } = this.state

    const allExtensions = {}
    installedManifestList.forEach((manifest) => {
      allExtensions[manifest.id] = {
        id: manifest.id,
        name: manifest.name,
        description: manifest.description,
        websiteUrl: manifest.homepageUrl,
        unknownSource: true
      }
    })

    extensions.forEach((extension) => {
      allExtensions[extension.id] = {
        ...extension,
        unknownSource: false
      }
    })

    return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={12}>
              <h1 style={styles.heading}>Extensions</h1>
              <div>
                {Object.keys(allExtensions).map((extensionId) => {
                  const info = allExtensions[extensionId]
                  return (
                    <ExtensionListItem
                      key={info.id}
                      extensionId={info.id}
                      name={info.name}
                      description={info.description}
                      iconUrl={info.iconUrl}
                      websiteUrl={info.websiteUrl}
                      licenseUrl={info.licenseUrl}
                      remoteUrl={info.remoteUrl}
                      unknownSource={info.unknownSource}
                      showRestart={showRestart} />
                  )
                })}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
