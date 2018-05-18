import PropTypes from 'prop-types'
import React from 'react'
import { Button, ListItemText, ListItemSecondaryAction, Icon } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import classNames from 'classnames'

const styles = {
  buttonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class SettingsListButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.fun,
    buttonProps: PropTypes.object,
    IconClass: PropTypes.any,
    iconClassName: PropTypes.string,
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
      IconClass,
      iconClassName,
      primary,
      secondary,
      ...passProps
    } = this.props

    const button = (
      <Button
        size='small'
        variant='raised'
        disabled={disabled}
        onClick={onClick}
        {...buttonProps}>
        {IconClass || iconClassName ? (
          IconClass ? (
            <IconClass className={classNames(classes.icon, iconClassName)} />
          ) : (
            <Icon className={classNames(classes.icon, iconClassName)} />
          )
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
        ) : undefined}
        {button}
      </SettingsListItem>
    )
  }
}

export default SettingsListButton
