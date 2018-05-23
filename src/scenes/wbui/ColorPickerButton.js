import PropTypes from 'prop-types'
import React from 'react'
import { Button, Popover } from '@material-ui/core'
import { ChromePicker } from 'react-color'

export default class ColorPickerButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    buttonProps: PropTypes.object,
    popoverProps: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    anchorEl: null
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { buttonProps, disabled, popoverProps, onChange, children, value, ...passProps } = this.props
    const { anchorEl } = this.state

    return (
      <div {...passProps}>
        <Button
          {...buttonProps}
          disabled={disabled}
          onClick={(evt) => this.setState({ anchorEl: evt.currentTarget })}>
          {children}
        </Button>
        <Popover
          {...popoverProps}
          disableEnforceFocus
          open={!!anchorEl}
          anchorEl={anchorEl}
          onClose={(evt) => this.setState({ anchorEl: null })}>
          <ChromePicker color={value} onChangeComplete={(col) => {
            if (onChange) {
              onChange({
                ...col,
                rgbaStr: `rgba(${col.rgb.r}, ${col.rgb.g}, ${col.rgb.b}, ${col.rgb.a})`
              })
            }
          }} />
        </Popover>
      </div>
    )
  }
}
