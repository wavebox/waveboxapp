import PropTypes from 'prop-types'
import React from 'react'
import { ListItemText, ListItemSecondaryAction, Switch } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListItem from './SettingsListItem'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  text: {
    paddingRight: 64
  }
}

@withStyles(styles)
class SettingsListItemSwitch extends React.Component {
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
        <ListItemText className={classes.text} primary={label} secondary={secondary} />
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

export default SettingsListItemSwitch
