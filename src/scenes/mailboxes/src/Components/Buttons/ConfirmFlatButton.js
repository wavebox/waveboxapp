import PropTypes from 'prop-types'
import React from 'react'
import {FlatButton} from 'material-ui'

export default class ConfirmFlatButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...FlatButton.propTypes,
    confirmLabel: PropTypes.string.isRequired,
    confirmIcon: PropTypes.node,
    confirmWaitMs: PropTypes.number.isRequired,
    onConfirmedClick: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.confirmingTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.confirmingTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return { confirming: false }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { confirmLabel, confirmWaitMs, onConfirmedClick, onClick, label, confirmIcon, icon, ...passProps } = this.props
    const { confirming } = this.state

    return (
      <FlatButton
        {...passProps}
        label={confirming ? confirmLabel : label}
        icon={confirmIcon && confirming ? confirmIcon : icon}
        onClick={(evt) => {
          if (onClick) { onClick(evt) }
          this.setState((prevState) => {
            if (prevState.confirming) {
              clearTimeout(this.confirmingTO)
              onConfirmedClick(evt)
              return { confirming: false }
            } else {
              clearTimeout(this.confirmingTO)
              this.confirmingTO = setTimeout(() => {
                this.setState({ confirming: false })
              }, confirmWaitMs)
              return { confirming: true }
            }
          })
        }} />
    )
  }
}
