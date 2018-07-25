import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import FASCheckIcon from 'wbfa/FASCheck'

const styles = {
  container: {
    border: '4px solid white',
    textAlign: 'center',
    cursor: 'pointer'
  },
  selectedIcon: {
    color: 'white',
    verticalAlign: 'text-bottom'
  }
}

@withStyles(styles)
class WizardColorPickerCell extends React.Component {
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
    const { color, isSelected, onPicked, size, className, classes, style, ...passProps } = this.props
    const { hovering } = this.state

    return (
      <div
        {...passProps}
        onClick={() => onPicked(color)}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        className={classNames(classes.container, className)}
        style={{
          width: size,
          height: size,
          lineHeight: size + 'px',
          backgroundColor: color,
          borderColor: hovering ? color : undefined,
          ...style
        }}>
        {isSelected ? (
          <FASCheckIcon className={classes.selectedIcon} style={{ fontSize: (size / 2) + 'px' }} />
        ) : undefined}
      </div>
    )
  }
}

export default WizardColorPickerCell
