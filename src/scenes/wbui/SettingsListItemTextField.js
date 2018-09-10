import PropTypes from 'prop-types'
import React from 'react'
import { TextField } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import classNames from 'classnames'

const styles = {
  textField: {
    fontSize: '0.8rem'
  }
}

@withStyles(styles)
class SettingsListItemTextField extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    textFieldProps: PropTypes.object,
    disabled: PropTypes.bool
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, disabled, className, label, textFieldProps, ...passProps } = this.props

    return (
      <SettingsListItem {...passProps}>
        <TextField
          label={label}
          margin='dense'
          disabled={disabled}
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...textFieldProps}
          InputProps={{
            ...textFieldProps.InputProps,

            // Composite arguments
            className: classNames(
              ((textFieldProps || {}).InputProps || {}).className,
              classes.textField
            )
          }} />
      </SettingsListItem>
    )
  }
}

export default SettingsListItemTextField
