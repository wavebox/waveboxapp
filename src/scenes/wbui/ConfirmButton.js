import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'

export default class ConfirmButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...Button.propTypes,
    confirmContent: PropTypes.any,
    content: PropTypes.any,
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

  state = {
    confirming: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClick = (evt) => {
    const { onClick, onConfirmedClick, confirmWaitMs } = this.props

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
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { confirmContent, content, confirmWaitMs, onConfirmedClick, onClick, ...passProps } = this.props
    const { confirming } = this.state

    return (
      <Button onClick={this.handleClick} {...passProps}>
        {confirming ? (confirmContent) : (content)}
      </Button>
    )
  }
}
