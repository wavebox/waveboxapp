import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WizardColorPickerCell from './WizardColorPickerCell'

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

export default class WizardColorPicker extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    MailboxClass: PropTypes.func.isRequired,
    accessMode: PropTypes.string.isRequired,
    mailboxDefaultColor: PropTypes.string.isRequired,
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
    const { MailboxClass, accessMode, mailboxDefaultColor, selectedColor, onColorPicked, style, ...passProps } = this.props

    return (
      <div {...passProps} style={{...styles.container, ...style}}>
        <WizardColorPickerCell
          key='default'
          style={styles.color}
          color={mailboxDefaultColor}
          isSelected={mailboxDefaultColor === selectedColor}
          size={60}
          onPicked={(col) => onColorPicked(col)} />
        {PRESET_COLORS.map((col) => {
          return (
            <WizardColorPickerCell
              key={col}
              style={styles.color}
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
