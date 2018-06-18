import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  webview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class ProSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
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
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      url: userStore.getState().user.billingUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      url: userState.user.billingUrl
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {className, classes, showRestart, ...passProps} = this.props
    const { url } = this.state

    return (
      <WaveboxWebView
        src={url}
        className={classNames(className, classes.webview)}
        {...passProps} />
    )
  }
}

export default ProSettings
