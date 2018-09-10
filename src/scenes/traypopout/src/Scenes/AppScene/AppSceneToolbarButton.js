import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { IconButton, Tooltip } from '@material-ui/core'

/**
* This is basically a shim to dismiss the tooltip on click which fixes
* https://github.com/wavebox/waveboxapp/issues/743. It does it by manually
* controlling the element and setting it to close on open. Open issue to avoid
* this shim in https://github.com/mui-org/material-ui/issues/12299
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
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      title,
      placement,
      children,
      onClick
    } = this.props
    const { open } = this.state

    return (
      <Tooltip
        open={open}
        onOpen={() => this.setState({ open: true })}
        onClose={() => this.setState({ open: false })}
        title={title}
        placement={placement}>
        <IconButton
          onClick={(evt) => {
            this.setState({ open: false })
            if (onClick) { onClick(evt) }
          }}>
          {children}
        </IconButton>
      </Tooltip>
    )
  }
}

export default AppSceneToolbarButton
