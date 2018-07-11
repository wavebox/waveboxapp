import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListItem from './SettingsListItem'
import ColorPickerButton from './ColorPickerButton'

const styles = {
  colorPickerButton: {
    overflow: 'hidden',
    marginRight: 6
  },
  colorPreview: {
    marginTop: -9,
    marginRight: 6,
    marginBottom: -9,
    marginLeft: -9,
    width: 32,
    height: 34,
    verticalAlign: 'middle',
    backgroundImage: 'repeating-linear-gradient(45deg, #EEE, #EEE 2px, #FFF 2px, #FFF 5px)'
  },
  colorPreviewIcon: {
    width: '100%',
    height: '100%',
    padding: 7
  },
  buttonIcon: {
    marginRight: 6,
    width: 18,
    height: 18,
    verticalAlign: 'middle'
  }
}

@withStyles(styles)
class SettingsListItemColorPicker extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    labelText: PropTypes.string.isRequired,
    IconClass: PropTypes.func,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    showClear: PropTypes.bool.isRequired,
    ClearIconClass: PropTypes.func,
    clearLabelText: PropTypes.string
  }

  static defaultProps = {
    showClear: true
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
      labelText,
      IconClass,
      disabled,
      value,
      onChange,
      showClear,
      ClearIconClass,
      clearLabelText,
      ...passProps
    } = this.props

    return (
      <SettingsListItem {...passProps}>
        <ColorPickerButton
          buttonProps={{ variant: 'raised', size: 'small', className: classes.colorPickerButton }}
          value={value}
          disabled={disabled}
          onChange={onChange}>
          {IconClass ? (
            <span className={classes.colorPreview}>
              <IconClass
                className={classes.colorPreviewIcon}
                style={disabled ? undefined : ColorPickerButton.generatePreviewIconColors(value)} />
            </span>
          ) : undefined}
          {labelText}
        </ColorPickerButton>
        {showClear ? (
          <Button
            variant='raised'
            size='small'
            disabled={disabled}
            onClick={() => { if (onChange) { onChange(undefined) } }}>
            {ClearIconClass ? (
              <ClearIconClass className={classes.buttonIcon} />
            ) : undefined}
            {clearLabelText}
          </Button>
        ) : undefined}
      </SettingsListItem>
    )
  }
}

export default SettingsListItemColorPicker
