import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import commonStyles from '../CommonSettingStyles'
import ExtensionListItem from './ExtensionListItem'
import { crextensionStore } from 'stores/crextension'
import { userStore } from 'stores/user'
import * as Colors from 'material-ui/styles/colors'

const styles = {
  container: {
    border: `2px solid ${Colors.lightBlue500}`,
    borderRadius: 4,
    padding: 16
  },
  heading: {
    marginTop: 0
  },
  subheading: {
    color: Colors.lightBlue500
  }
}

export default class UpgradeExtensionList extends React.Component {
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
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    crextensionStore.unlisten(this.extensionUpdated)
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the extension ids
  * @param crextensionState=autoget: the crextension store state
  * @param userState=autoget: the user store state
  * @return a list of extension ids
  */
  generateExtensionIds (crextensionState = crextensionStore.getState(), userState = userStore.getState()) {
    return userState.supportedExtensionList()
      .filter((ext) => {
        if (crextensionState.hasExtensionInstalled(ext.id)) { return false }
        if (userState.user.hasExtensionWithLevel(ext.availableTo)) { return false }
        return true
      })
      .map((ext) => ext.id)
  }

  state = (() => {
    return {
      extensionIds: this.generateExtensionIds()
    }
  })()

  extensionUpdated = (crextensionState) => {
    this.setState({
      extensionIds: this.generateExtensionIds(crextensionState, undefined)
    })
  }

  userUpdated = (userState) => {
    this.setState({
      extensionIds: this.generateExtensionIds(undefined, userState)
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the pro dialog
  */
  handleOpenPro = () => {
    window.location.hash = '/pro'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {showRestart, style, ...passProps} = this.props
    const { extensionIds } = this.state

    if (extensionIds.length === 0) { return false }

    return (
      <div style={{...styles.container, ...style}} {...passProps}>
        <h1 style={{...commonStyles.heading, ...styles.heading}}>More Extensions</h1>
        <div>
          <p style={styles.subheading}>These additional extensions are available when you purchase Wavebox</p>
          <RaisedButton
            primary
            label='Purchase Wavebox'
            onClick={this.handleOpenPro} />
        </div>
        {extensionIds.map((id) => {
          return (
            <ExtensionListItem
              key={id}
              extensionId={id}
              showRestart={showRestart} />
          )
        })}
      </div>
    )
  }
}
