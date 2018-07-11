import PropTypes from 'prop-types'
import React from 'react'
import { ListItemText, ListItemSecondaryAction } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import ConfirmButton from './ConfirmButton'

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
class SettingsListItemConfirmButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    icon: PropTypes.node,
    confirmLabel: PropTypes.node.isRequired,
    confirmIcon: PropTypes.node,
    confirmWaitMs: PropTypes.number,
    onConfirmedClick: PropTypes.func,
    disabled: PropTypes.bool,
    buttonProps: PropTypes.object,
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
      icon,
      confirmLabel,
      confirmIcon,
      confirmWaitMs,
      onConfirmedClick,
      buttonProps,
      primary,
      secondary,
      children,
      ...passProps
    } = this.props

    const button = (
      <ConfirmButton
        size='small'
        variant='raised'
        disabled={disabled}
        content={(
          <span>
            {icon ? (
              <span className={classes.iconWrap}>{icon}</span>
            ) : undefined}
            {label}
          </span>
        )}
        confirmContent={(
          <span>
            {confirmIcon ? (
              <span className={classes.iconWrap}>{confirmIcon}</span>
            ) : undefined}
            {confirmLabel}
          </span>
        )}
        confirmWaitMs={confirmWaitMs}
        onConfirmedClick={onConfirmedClick}
        {...buttonProps} />
    )

    return primary || secondary ? (
      <SettingsListItem {...passProps}>
        <ListItemText primary={primary} secondary={secondary} />
        <ListItemSecondaryAction>
          {button}
        </ListItemSecondaryAction>
        {children}
      </SettingsListItem>
    ) : (
      <SettingsListItem {...passProps}>
        {button}
        {children}
      </SettingsListItem>
    )
  }
}

export default SettingsListItemConfirmButton
