import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import ServiceTooltipContent from './ServiceTooltipContent'

class ServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: false
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  handleTooltipOpen = () => {
    this.setState({ open: true })
  }

  handleTooltipClose = () => {
    this.setState({ open: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      className,
      children,
      ...passProps
    } = this.props
    const {
      open
    } = this.state

    return (
      <PrimaryTooltip
        interactive
        disablePadding
        width={400}
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        open={open}
        title={(
          <ServiceTooltipContent
            serviceId={serviceId} />
        )}
        {...passProps}>
        {children}
      </PrimaryTooltip>
    )
  }
}

export default ServiceTooltip
