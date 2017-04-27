import './AccountMessageScene.less'
import React from 'react'
import { Dialog, RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import { settingsActions } from 'stores/settings'

export default class AccountMessageScene extends React.Component {
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
      open: true,
      url: userStore.getState().user.accountMessageUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      url: userState.user.accountMessageUrl
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    settingsActions.setSeenAccountMessageUrl(this.state.url)
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, url } = this.state

    return (
      <Dialog
        modal={false}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        bodyClassName='ReactComponent-MessageDialog-Body'
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <WaveboxWebView src={url} />
      </Dialog>
    )
  }
}
