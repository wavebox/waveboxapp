import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, Popover } from 'material-ui'
import { ChromePicker } from 'react-color'

export default class ColorPickerButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    value: PropTypes.string,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    anchorOrigin: PropTypes.object.isRequired,
    targetOrigin: PropTypes.object.isRequired,
    icon: PropTypes.node,
    onChange: PropTypes.func
  }

  static defaultProps = {
    label: 'Pick Colour',
    disabled: false,
    anchorOrigin: {horizontal: 'left', vertical: 'bottom'},
    targetOrigin: {horizontal: 'left', vertical: 'top'}
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: false,
      anchor: null
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { label, disabled, onChange, anchorOrigin, targetOrigin, icon, ...passProps } = this.props
    return (
      <div {...passProps}>
        <RaisedButton
          icon={icon}
          label={label}
          disabled={disabled}
          onClick={(evt) => this.setState({ open: true, anchor: evt.target })} />
        <Popover
          anchorOrigin={anchorOrigin}
          targetOrigin={targetOrigin}
          anchorEl={this.state.anchor}
          open={this.state.open}
          onRequestClose={() => this.setState({open: false})}>
          <ChromePicker
            color={this.props.value}
            onChangeComplete={(col) => {
              if (onChange) {
                onChange(Object.assign({}, col, {
                  rgbaStr: `rgba(${col.rgb.r}, ${col.rgb.g}, ${col.rgb.b}, ${col.rgb.a})`
                }))
              }
            }} />
        </Popover>
      </div>
    )
  }
}
