import PropTypes from 'prop-types'
import React from 'react'
import { Button, ListItemText } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import classNames from 'classnames'

const styles = {
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  buttonsContainer: {
    marginTop: 6,
    '&>*': {
      marginLeft: 4,
      marginRight: 4
    },
    '&>*:first-child': {
      marginLeft: 0
    },
    '&>*:last-child': {
      marginRight: 0
    }
  },
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
class SettingsListItemMultiButtons extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
      onClick: PropTypes.func,
      passProps: PropTypes.object
    })).isRequired,
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
      buttons,
      primary,
      secondary,
      children,
      className,
      ...passProps
    } = this.props

    const buttonElements = buttons.map((buttonProps, index) => {
      return (
        <Button
          key={`autobutton_${index}`}
          size='small'
          variant='raised'
          disabled={buttonProps.disabled}
          onClick={buttonProps.onClick}
          {...buttonProps.passProps}>
          {buttonProps.icon ? (
            <span className={classes.iconWrap}>
              {buttonProps.icon}
            </span>
          ) : undefined}
          {buttonProps.label}
        </Button>
      )
    })

    return (
      <SettingsListItem className={classNames(classes.root, className)} {...passProps}>
        {primary || secondary ? (
          <ListItemText primary={primary} secondary={secondary} />
        ) : undefined}
        <div className={classes.buttonsContainer}>
          {buttonElements}
        </div>
        {children}
      </SettingsListItem>
    )
  }
}

export default SettingsListItemMultiButtons
