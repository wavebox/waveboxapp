import React from 'react'
import PropTypes from 'prop-types'
import { Dialog } from '@material-ui/core'
import DefaultRouterDialogManager from './DefaultRouterDialogManager'

export default class RouterDialog extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired,
    manager: PropTypes.object.isRequired
  }

  static defaultProps = {
    manager: DefaultRouterDialogManager
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const { routeName } = this.props
    this.props.manager.on(`mount-${routeName}`, this.controllerDidMount)
    this.props.manager.on(`unmount-${routeName}`, this.controllerDidUnmount)
  }

  componentWillUnmount () {
    const { routeName } = this.props
    this.props.manager.removeListener(`mount-${routeName}`, this.controllerDidMount)
    this.props.manager.removeListener(`unmount-${routeName}`, this.controllerDidUnmount)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.routeName !== nextProps.routeName || this.props.manager !== nextProps.manager) {
      this.props.manager.removeListener(`mount-${this.props.routeName}`, this.controllerDidMount)
      this.props.manager.removeListener(`unmount-${this.props.routeName}`, this.controllerDidUnmount)
      nextProps.manager.on(`mount-${nextProps.routeName}`, this.controllerDidMount)
      nextProps.manager.on(`unmount-${nextProps.routeName}`, this.controllerDidUnmount)
      this.setState({ open: nextProps.manager.controllerIsMounted(nextProps.routeName) })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: this.props.manager.controllerIsMounted(this.props.routeName)
  }

  controllerDidMount = () => {
    this.setState({ open: true })
  }

  controllerDidUnmount = () => {
    this.setState({ open: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { routeName, manager, children, ...passProps } = this.props
    const { open } = this.state

    return (
      <Dialog open={open} {...passProps}>
        {children}
      </Dialog>
    )
  }
}
