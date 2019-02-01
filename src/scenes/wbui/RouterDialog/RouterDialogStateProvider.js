import React from 'react'
import PropTypes from 'prop-types'
import DefaultRouterDialogManager from './DefaultRouterDialogManager'

export default class RouterDialogStateProvider extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired,
    manager: PropTypes.object.isRequired,
    Component: PropTypes.func.isRequired,
    location: PropTypes.bool.isRequired,
    match: PropTypes.bool.isRequired
  }

  static defaultProps = {
    manager: DefaultRouterDialogManager,
    location: false,
    match: true
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const { manager, routeName } = this.props
    manager.on(`route-${routeName}-changed`, this.matchChanged)
  }

  componentWillUnmount () {
    const { manager, routeName } = this.props
    manager.removeListener(`route-${routeName}-changed`, this.matchChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.routeName !== nextProps.routeName || this.props.manager !== nextProps.manager) {
      this.props.manager.removeListener(`route-${this.props.routeName}-changed`, this.matchChanged)
      nextProps.manager.on(`route-${nextProps.routeName}-changed`, this.matchChanged)
      this.setState({
        match: nextProps.manager.controllerMatch(nextProps.routeName),
        location: nextProps.manager.controllerLocation(nextProps.routeName)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    match: this.props.manager.controllerMatch(this.props.routeName),
    location: this.props.manager.controllerLocation(this.props.routeName)
  }

  matchChanged = (evt, match, location) => {
    this.setState({ match: match, location: location })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      routeName,
      manager,
      Component,
      children,
      location,
      match,
      ...passProps
    } = this.props
    const stateProps = {
      ...(match ? { match: this.state.match } : undefined),
      ...(location ? { location: this.state.location } : undefined)
    }

    return (
      <Component {...stateProps} {...passProps}>
        {children}
      </Component>
    )
  }
}
