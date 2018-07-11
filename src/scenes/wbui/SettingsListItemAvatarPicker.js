import PropTypes from 'prop-types'
import React from 'react'
import { Button, Avatar } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import FileUploadButton from './FileUploadButton'
import classNames from 'classnames'

const styles = {
  iconWrap: {
    display: 'inline-block',
    marginRight: 6,
    '&>*': {
      width: 18,
      height: 18,
      verticalAlign: 'middle'
    }
  },
  fileUploadButton: {
    marginRight: 6
  },
  avatar: {
    height: 36,
    width: 36,
    marginRight: 6,
    border: '1px solid #EEE',
    backgroundImage: 'repeating-linear-gradient(45deg, #EEE, #EEE 2px, #FFF 2px, #FFF 5px)'
  },
  avatarDisabled: {
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
class SettingsLiteItemAvatarPicker extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    label: PropTypes.node.isRequired,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    preview: PropTypes.string,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    clearLabel: PropTypes.node.isRequired,
    clearIcon: PropTypes.node
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
      label,
      icon,
      disabled,
      preview,
      onChange,
      onClear,
      clearLabel,
      clearIcon,
      ...passProps
    } = this.props

    return (
      <SettingsListItem {...passProps}>
        <Avatar className={classNames(classes.avatar, disabled ? classes.avatarDisabled : undefined)} src={preview} />
        <FileUploadButton
          className={classes.fileUploadButton}
          size='small'
          disabled={disabled}
          variant='raised'
          accept='image/*'
          onChange={onChange}>
          {icon ? (
            <span className={classes.iconWrap}>{icon}</span>
          ) : undefined}
          {label}
        </FileUploadButton>
        <Button
          size='small'
          variant='raised'
          disabled={disabled}
          onClick={() => { if (onClear) { onClear() } }}>
          {clearIcon ? (
            <span className={classes.iconWrap}>
              {clearIcon}
            </span>
          ) : undefined}
          {clearLabel}
        </Button>
      </SettingsListItem>
    )
  }
}

export default SettingsLiteItemAvatarPicker
