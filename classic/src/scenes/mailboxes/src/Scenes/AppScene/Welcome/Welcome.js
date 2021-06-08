import React from 'react'
import WaveboxWelcome from './WaveboxWelcome'
import OrganizationWelcome from './OrganizationWelcome'
import { userStore } from 'stores/user'

class Welcome extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      isOrg: userStore.getState().user.ows.enabled
    }
  })()

  userChanged = (userState) => {
    this.setState({
      isOrg: userState.user.ows.enabled
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { isOrg } = this.state

    if (isOrg) {
      return (<OrganizationWelcome {...this.props} />)
    } else {
      return (<WaveboxWelcome {...this.props} />)
    }
  }
}

export default Welcome
