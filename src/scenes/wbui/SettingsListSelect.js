import PropTypes from 'prop-types'
import React from 'react'
import { ListItemText, ListItemSecondaryAction, Select, MenuItem, Divider } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'

const styles = {
  secondaryAction: {
    maxWidth: 150,
    width: '100%'
  },
  select: {
    fontSize: '0.8rem'
  }
}

@withStyles(styles)
class SettingsListSelect extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    secondary: PropTypes.node,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired,
    options: PropTypes.array.isRequired,
    disabled: PropTypes.bool
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, disabled, className, label, secondary, onChange, value, options, ...passProps } = this.props

    return (
      <SettingsListItem {...passProps}>
        <ListItemText primary={label} secondary={secondary} />
        <ListItemSecondaryAction className={classes.secondaryAction}>
          <Select
            margin='dense'
            className={classes.select}
            disabled={disabled}
            fullWidth
            value={value}
            disableUnderline
            renderValue={(value) => {
              return (options.find((opt) => opt.value === value) || {}).label
            }}
            onChange={(evt) => { onChange(evt, evt.target.value) }}>
            {options.map((opt, i) => {
              if (opt.divider) {
                return (<Divider key={`divider-${i}`} />)
              } else {
                return (
                  <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.primaryText ? opt.primaryText : opt.label}
                  </MenuItem>
                )
              }
            })}
          </Select>
        </ListItemSecondaryAction>
      </SettingsListItem>
    )
  }
}

export default SettingsListSelect
