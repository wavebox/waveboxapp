import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WizardColorPickerCell from './WizardColorPickerCell'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const PRESET_COLORS = [
  'rgb(123, 109, 179)',
  'rgb(57, 138, 186)',
  'rgb(248, 183, 50)',
  'rgb(98, 175, 184)',
  'rgb(238, 86, 101)',
  'rgb(106, 145, 168)',
  'rgb(137, 132, 149)',
  'rgb(233, 140, 170)',
  'rgb(72, 157, 207)',
  'rgb(77, 180, 177)',
  'rgb(73, 102, 134)',
  'rgb(253, 219, 51)'
]

const styles = {
  color: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  container: {
    padding: 8,
    backgroundColor: 'white',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  }
}

@withStyles(styles)
class WizardColorPicker extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    colors: PropTypes.array.isRequired,
    accessMode: PropTypes.string.isRequired,
    selectedColor: PropTypes.string.isRequired,
    onColorPicked: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      colors,
      accessMode,
      selectedColor,
      onColorPicked,
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <div {...passProps} className={classNames(classes.container, className)}>
        {colors.map((col) => {
          return (
            <WizardColorPickerCell
              key={`additional-${col}`}
              className={classes.color}
              color={col}
              isSelected={col === selectedColor}
              size={60}
              onPicked={(col) => onColorPicked(col)} />
          )
        })}
        {PRESET_COLORS.map((col) => {
          return (
            <WizardColorPickerCell
              key={col}
              className={classes.color}
              color={col}
              isSelected={col === selectedColor}
              size={60}
              onPicked={(col) => onColorPicked(col)} />
          )
        })}
      </div>
    )
  }
}

export default WizardColorPicker
