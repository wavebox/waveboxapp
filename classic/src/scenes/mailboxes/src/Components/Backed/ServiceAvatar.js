import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import Resolver from 'Runtime/Resolver'
import ACAvatarCircle2 from 'wbui/ACAvatarCircle2'

export default class ServiceAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState({
        avatar: accountStore.getState().getServiceAvatarConfig(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      avatar: accountStore.getState().getServiceAvatarConfig(this.props.serviceId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      avatar: accountState.getServiceAvatarConfig(this.props.serviceId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceId, ...passProps } = this.props
    const { avatar } = this.state

    return (
      <ACAvatarCircle2
        avatar={avatar}
        resolver={(i) => Resolver.image(i)}
        {...passProps} />
    )
  }
}
