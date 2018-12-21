import React from 'react'
import PropTypes from 'prop-types'
import DefaultRouterDialogManager from './DefaultRouterDialogManager'
import uuid from 'uuid'

export default class RouterDialog extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    routeName: PropTypes.string.isRequired,
    manager: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
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
    const { manager, routeName, match } = this.props
    manager.controllerDidMount(routeName, this.instanceId, match)
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
    if (this.props.match !== nextProps.match) {
      nextProps.manager.updateControllerMatch(nextProps.routeName, this.instanceId, nextProps.match)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return false
  }
}
