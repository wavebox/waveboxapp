import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import ExtensionListItem from './ExtensionListItem'
import { crextensionStore } from 'stores/crextension'
import { userStore } from 'stores/user'
import lightBlue from '@material-ui/core/colors/lightBlue'
import grey from '@material-ui/core/colors/grey'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  container: {
    border: `2px solid ${lightBlue[500]}`,
    borderRadius: 4,
    padding: 16
  },
  heading: {
    marginTop: 0,
    color: grey[900],
    fontWeight: 'normal',
    marginBottom: 10
  },
  subheading: {
    color: lightBlue[500]
  }
}

@withStyles(styles)
class UpgradeExtensionList extends React.Component {
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
    const {showRestart, classes, className, ...passProps} = this.props
    const { extensionIds } = this.state

    if (extensionIds.length === 0) { return false }

    return (
      <div className={classNames(classes.container, className)} {...passProps}>
        <h1 className={classes.heading}>More Extensions</h1>
        <div>
          <p className={classes.subheading}>These additional extensions are available when you purchase Wavebox</p>
          <Button variant='raised' color='primary' onClick={this.handleOpenPro}>
            Purchase Wavebox
          </Button>
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

export default UpgradeExtensionList
