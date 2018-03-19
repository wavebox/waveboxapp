import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { FontIcon } from 'material-ui'

const styles = {
  container: {
    borderWidth: 4,
    borderStyle: 'solid',
    textAlign: 'center',
    cursor: 'pointer'
  },
  selectedIcon: {
    color: 'white'
  }
}

export default class WizardColorPickerCell extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onPicked: PropTypes.func.isRequired,
    size: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    hovering: false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { color, isSelected, onPicked, size, style, ...passProps } = this.props
    const { hovering } = this.state

    return (
      <div
        {...passProps}
        onClick={() => onPicked(color)}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        style={{
          ...styles.container,
          width: size,
          height: size,
          lineHeight: size + 'px',
          backgroundColor: color,
          borderColor: hovering ? color : 'white',
          ...style
        }}>
        {isSelected ? (
          <FontIcon
            className='fas fa-check'
            style={{
              ...styles.selectedIcon,
              verticalAlign: 'text-bottom',
              fontSize: (size / 2) + 'px'
            }} />
        ) : undefined}
      </div>
    )
  }
}
