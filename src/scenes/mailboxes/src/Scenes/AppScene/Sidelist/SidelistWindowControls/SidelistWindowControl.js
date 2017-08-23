import React from 'react'
import PropTypes from 'prop-types'
import { FontIcon, IconButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

const TYPES = Object.freeze({
  RESTORE: 'RESTORE',
  MAXIMIZE: 'MAXIMIZE',
  MINIMIZE: 'MINIMIZE',
  CLOSE: 'CLOSE'
})
const styles = {
  button: {
    width: 20,
    height: 20,
    padding: 0,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    borderRadius: 2
  },
  buttonHovered: {
    backgroundColor: Colors.blueGrey700
  },
  icon: {
    fontSize: 14
  }
}

export default class SidelistWindowControl extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static TYPES = TYPES
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    type: PropTypes.oneOf(Object.keys(TYPES)).isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the icon for the given type
  * @param type: the type to render
  * @return jsx
  */
  renderIconForType (type) {
    switch (type) {
      case TYPES.RESTORE:
        return (<FontIcon className='fa fa-fw fa-window-restore' color={Colors.blueGrey50} />)
      case TYPES.MAXIMIZE:
        return (<FontIcon className='fa fa-fw fa-window-maximize' color={Colors.blueGrey50} />)
      case TYPES.MINIMIZE:
        return (<FontIcon className='fa fa-fw fa-window-minimize' color={Colors.blueGrey50} />)
      case TYPES.CLOSE:
        return (<FontIcon className='fa fa-fw fa-window-close' color={Colors.blueGrey50} />)
    }
  }

  render () {
    const { onClick, type, style, hoveredStyle, iconStyle, ...passProps } = this.props

    return (
      <IconButton
        {...passProps}
        onClick={onClick}
        style={{...styles.button, ...style}}
        hoveredStyle={{...styles.buttonHovered, ...hoveredStyle}}
        iconStyle={{...styles.icon, ...iconStyle}}>
        {this.renderIconForType(type)}
      </IconButton>
    )
  }
}
