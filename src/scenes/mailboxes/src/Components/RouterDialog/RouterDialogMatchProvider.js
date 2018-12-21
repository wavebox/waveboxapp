import React from 'react'
import PropTypes from 'prop-types'
import DefaultRouterDialogManager from './DefaultRouterDialogManager'

export default class RouterDialogMatchProvider extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired,
    manager: PropTypes.object.isRequired,
    Component: PropTypes.func.isRequired
  }

  static defaultProps = {
    manager: DefaultRouterDialogManager
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const { manager, routeName } = this.props
    manager.on(`match-${routeName}-changed`, this.matchChanged)
  }

  componentWillUnmount () {
    const { manager, routeName } = this.props
    manager.removeListener(`match-${routeName}-changed`, this.matchChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.routeName !== nextProps.routeName || this.props.manager !== nextProps.manager) {
      this.props.manager.removeListener(`match-${this.props.routeName}-changed`, this.matchChanged)
      nextProps.manager.on(`match-${nextProps.routeName}-changed`, this.matchChanged)
      this.setState({
        match: nextProps.controllerMatch(nextProps.routeName)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    match: this.props.manager.controllerMatch(this.props.routeName)
  }

  matchChanged = (evt, match) => {
    this.setState({ match: match })
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
      ...passProps
    } = this.props
    const { match } = this.state

    return (
      <Component match={match} {...passProps}>
        {children}
      </Component>
    )
  }
}
