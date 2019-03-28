import React from 'react'
import PropTypes from 'prop-types'
import DefaultRouterDialogManager from './DefaultRouterDialogManager'
import uuid from 'uuid'

export default class RouterDialog extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired,
    manager: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  }

  static defaultProps = {
    manager: DefaultRouterDialogManager
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.instance = uuid.v4()
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const { manager, routeName, match, location } = this.props
    manager.controllerDidMount(routeName, this.instanceId, match, location)
  }

  componentWillUnmount () {
    const { manager, routeName } = this.props
    manager.controllerDidUnmount(routeName, this.instanceId)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.routeName !== nextProps.routeName || this.props.manager !== nextProps.manager) {
      nextProps.manager.controllerDidMount(nextProps.routeName, this.instanceId)
      this.props.manager.controllerDidUnmount(this.props.routeName, this.instanceId)
    }
    if (this.props.match !== nextProps.match || this.props.location !== nextProps.location) {
      nextProps.manager.updateControllerMatch(nextProps.routeName, this.instanceId, nextProps.match, nextProps.location)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return false
  }
}
