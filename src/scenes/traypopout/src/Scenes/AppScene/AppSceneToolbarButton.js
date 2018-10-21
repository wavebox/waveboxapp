import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { IconButton, Tooltip } from '@material-ui/core'

/**
* This is basically a shim to dismiss the tooltip on click which fixes
* https://github.com/wavebox/waveboxapp/issues/743. It does it by manually
* controlling the element and setting it to close on open. Open issue to avoid
* this shim in https://github.com/mui-org/material-ui/issues/12299
*
* There's also a partial shim to this in the provider which blurs and moves
* the mouse
*/
class AppSceneToolbarButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    title: PropTypes.node.isRequired,
    placement: PropTypes.string
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = { open: false }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleOnOpen = () => {
    this.setState({ open: true })
  }

  handleOnClose = () => {
    this.setState({ open: false })
  }

  handleClick = (evt) => {
    const { onClick } = this.props
    this.setState({ open: false })
    if (onClick) { onClick(evt) }
  }

  handleContextMenu = (evt) => {
    const { onContextMenu } = this.props
    this.setState({ open: false })
    if (onContextMenu) { onContextMenu(evt) }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      title,
      placement,
      children
    } = this.props
    const { open } = this.state

    return (
      <Tooltip
        open={open}
        onOpen={this.handleOnOpen}
        onClose={this.handleOnClose}
        title={title}
        placement={placement}>
        <IconButton
          onClick={this.handleClick}
          onContextMenu={this.handleContextMenu}>
          {children}
        </IconButton>
      </Tooltip>
    )
  }
}

export default AppSceneToolbarButton
