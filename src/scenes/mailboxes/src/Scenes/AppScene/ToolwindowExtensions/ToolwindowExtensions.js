import React from 'react'
import PropTypes from 'prop-types'
import CoreExtensionManifest from 'shared/Models/Extensions/CoreExtensionManifest'
import ToolwindowExtension from './ToolwindowExtension'
import { extensionStore } from 'stores/extension'

export default class ToolwindowExtensions extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    position: PropTypes.oneOf(Object.keys(CoreExtensionManifest.TOOLWINDOW_POSITIONS))
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    extensionStore.listen(this.extensionUpdated)
  }

  componentWillUnmount () {
    extensionStore.unlisten(this.extensionUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.position !== nextProps.position) {
      this.setState({
        installIds: extensionStore.getState()
          .getInstalledWithToolwindows(nextProps.position)
          .map((extension) => extension.installId)
      })
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      installIds: extensionStore.getState()
        .getInstalledWithToolwindows(this.props.position)
        .map((extension) => extension.installId)
    }
  })()

  extensionUpdated = (extensionState) => {
    this.setState({
      installIds: extensionState
        .getInstalledWithToolwindows(this.props.position)
        .map((extension) => extension.installId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the positional styling
  * @param position: the position
  * @return a style object for this position
  */
  renderPositionalStyling (position) {
    switch (position) {
      case CoreExtensionManifest.TOOLWINDOW_POSITIONS.BOTTOM:
        return {
          flexDirection: 'column'
        }
      case CoreExtensionManifest.TOOLWINDOW_POSITIONS.SIDEBAR_O:
        return {
          flexDirection: 'row'
        }
      default: return {}
    }
  }

  render () {
    const { position, ...passProps } = this.props
    const { installIds } = this.state
    if (!installIds.length) { return false }

    return (
      <div {...passProps}>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          ...this.renderPositionalStyling(position)
        }}>
          {installIds.map((installId) => {
            return (
              <ToolwindowExtension
                key={installId}
                installId={installId}
                position={position} />)
          })}
        </div>
      </div>
    )
  }
}
