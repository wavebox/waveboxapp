import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../CommonSettingStyles'
import ExtensionListItem from './ExtensionListItem'
import { crextensionStore } from 'stores/crextension'

export default class InstalledExtensionList extends React.Component {
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
      extensionIds: crextensionStore.getState().extensionIds()
    }
  })()

  extensionUpdated = (crextensionState) => {
    this.setState({
      extensionIds: crextensionStore.getState().extensionIds()
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
    const { extensionIds } = this.state

    return (
      <div {...passProps}>
        <h1 style={styles.heading}>Installed Extensions</h1>
        {extensionIds.length ? extensionIds.map((id) => {
          return (
            <ExtensionListItem
              key={id}
              showBetaTrial
              extensionId={id}
              showRestart={showRestart} />
          )
        }) : (
          <div>You don't have any extensions installed...</div>
        )}
      </div>
    )
  }
}
