import PropTypes from 'prop-types'
import React from 'react'
import { Button, ListItemText, ListItemSecondaryAction } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'

const styles = {
  iconWrap: {
    display: 'inline-block',
    marginRight: 6,
    '&>*': {
      width: 18,
      height: 18,
      verticalAlign: 'middle'
    }
  }
}

@withStyles(styles)
class SettingsListItemButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    buttonProps: PropTypes.object,
    icon: PropTypes.node,
    primary: PropTypes.node,
    secondary: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      disabled,
      label,
      onClick,
      buttonProps,
      icon,
      primary,
      secondary,
      children,
      ...passProps
    } = this.props

    const button = (
      <Button
        size='small'
        variant='raised'
        disabled={disabled}
        onClick={onClick}
        {...buttonProps}>
        {icon ? (
          <span className={classes.iconWrap}>
            {icon}
          </span>
        ) : undefined}
        {label}
      </Button>
    )

    return (
      <SettingsListItem {...passProps}>
        {primary || secondary ? (
          <span>
            <ListItemText primary={primary} secondary={secondary} />
            <ListItemSecondaryAction>
              {button}
            </ListItemSecondaryAction>
          </span>
        ) : (
          button
        )}
        {children}
      </SettingsListItem>
    )
  }
}

export default SettingsListItemButton
