import PropTypes from 'prop-types'
import React from 'react'
import { ListItemText, ListItemSecondaryAction, Switch } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from 'material-ui/styles'
import SettingsListItem from './SettingsListItem'

const styles = {

}

@withStyles(styles)
class SettingsListSwitch extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    secondary: PropTypes.node,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, disabled, className, label, onChange, checked, secondary, ...passProps } = this.props

    return (
      <SettingsListItem {...passProps}>
        <ListItemText primary={label} secondary={secondary} />
        <ListItemSecondaryAction>
          <Switch
            color='primary'
            disabled={disabled}
            onChange={onChange}
            checked={checked}
          />
        </ListItemSecondaryAction>
      </SettingsListItem>
    )
  }
}

export default SettingsListSwitch
