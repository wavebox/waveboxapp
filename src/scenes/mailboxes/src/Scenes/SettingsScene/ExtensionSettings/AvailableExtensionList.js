import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ExtensionListItem from './ExtensionListItem'
import { userStore } from 'stores/user'
import grey from '@material-ui/core/colors/grey'
import { withStyles } from '@material-ui/core/styles'
import KRXFramework from 'Runtime/KRXFramework'

const styles = {
  heading: {
    marginTop: 30,
    color: grey[900],
    fontWeight: 'normal',
    marginBottom: 10
  }
}

@withStyles(styles)
class AvailableExtensionList extends React.Component {
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
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the extension ids
  * @param userState=autoget: the user store state
  * @return a list of extension ids
  */
  generateExtensionIds (userState = userStore.getState()) {
    return userState.supportedExtensionList()
      .filter((ext) => {
        if (KRXFramework.hasExtensionInstalled(ext.id)) { return false }
        if (!userState.user.hasExtensionWithLevel(ext.availableTo)) { return false }
        return true
      })
      .map((ext) => ext.id)
  }

  state = (() => {
    return {
      extensionIds: this.generateExtensionIds()
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      extensionIds: this.generateExtensionIds(userState)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, classes, ...passProps } = this.props
    const { extensionIds } = this.state

    if (extensionIds.length === 0) { return false }

    return (
      <div {...passProps}>
        <h1 className={classes.heading}>Available Extensions</h1>
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

export default AvailableExtensionList
