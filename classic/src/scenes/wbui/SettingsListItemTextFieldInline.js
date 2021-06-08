import PropTypes from 'prop-types'
import React from 'react'
import { ListItemText, ListItemSecondaryAction, TextField } from '@material-ui/core'
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
class SettingsListItemTextFieldInline extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    secondary: PropTypes.node,
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
    const { classes, disabled, className, label, secondary, textFieldProps, ...passProps } = this.props

    return (
      <SettingsListItem {...passProps}>
        <ListItemText primary={label} secondary={secondary} />
        <ListItemSecondaryAction>
          <TextField
            margin='dense'
            disabled={disabled}
            {...textFieldProps}
            InputProps={{
              // Overwritable arguments
              disableUnderline: true,

              ...textFieldProps.InputProps,

              // Composite arguments
              className: classNames(
                ((textFieldProps || {}).InputProps || {}).className,
                classes.textField
              )
            }} />
        </ListItemSecondaryAction>
      </SettingsListItem>
    )
  }
}

export default SettingsListItemTextFieldInline
