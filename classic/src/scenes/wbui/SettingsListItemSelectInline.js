import PropTypes from 'prop-types'
import React from 'react'
import { ListItemText, ListItemSecondaryAction, Select } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import SettingsListItemSelectOptionRenderer from './SettingsListItemSelectOptionRenderer'

const styles = {
  secondaryAction: {
    maxWidth: 150,
    width: '100%'
  },
  selectRoot: {
    fontSize: '0.8rem'
  },
  selectControl: {
    '&:focus': {
      backgroundColor: 'transparent'
    }
  }
}

@withStyles(styles)
class SettingsListItemSelectInline extends React.Component {
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
            MenuProps={{
              disableEnforceFocus: true,
              MenuListProps: { dense: true }
            }}
            classes={{ select: classes.selectControl }}
            margin='dense'
            className={classes.selectRoot}
            disabled={disabled}
            fullWidth
            value={value}
            disableUnderline
            renderValue={(value) => SettingsListItemSelectOptionRenderer.renderValue(options, value)}
            onChange={(evt) => { onChange(evt, evt.target.value) }}>
            {SettingsListItemSelectOptionRenderer.renderOptions(options)}
          </Select>
        </ListItemSecondaryAction>
      </SettingsListItem>
    )
  }
}

export default SettingsListItemSelectInline
