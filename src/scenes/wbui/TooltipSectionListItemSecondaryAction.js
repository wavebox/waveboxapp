import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItemSecondaryAction } from '@material-ui/core'
import TooltipSectionListItemSecondaryActionButton from './TooltipSectionListItemSecondaryActionButton'

const styles = (theme) => ({
  root: {

  }
})

@withStyles(styles, { withTheme: true })
class TooltipSectionListItemSecondaryAction extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    disableButton: PropTypes.bool.isRequired
  }

  static defaultProps = {
    disableButton: false
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
      className,
      theme,
      children,
      onClick,
      disableButton,
      ...passProps
    } = this.props

    return (
      <ListItemSecondaryAction
        className={classNames(className, classes.root)}
        onClick={disableButton ? onClick : undefined}
        {...passProps}>
        {disableButton ? children : (
          <TooltipSectionListItemSecondaryActionButton onClick={onClick}>
            {children}
          </TooltipSectionListItemSecondaryActionButton>
        )}
      </ListItemSecondaryAction>
    )
  }
}

export default TooltipSectionListItemSecondaryAction
