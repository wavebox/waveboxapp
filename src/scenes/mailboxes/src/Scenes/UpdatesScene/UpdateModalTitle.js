import React from 'react'
import PropTypes from 'prop-types'
import { FontIcon } from 'material-ui'

export default class UpdateModalTitle extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired
  }
  static defaultProps = {
    text: 'Wavebox Updates',
    color: 'black',
    iconName: 'system_update_alt'
  }

  render () {
    const { text, color, iconName, ...passProps } = this.props
    return (
      <h3 {...passProps}>
        <FontIcon
          className='material-icons'
          color={color}
          style={{ verticalAlign: 'text-top', marginRight: 10 }}>
          {iconName}
        </FontIcon>
        <span style={{ color: color }}>{text}</span>
      </h3>
    )
  }
}
