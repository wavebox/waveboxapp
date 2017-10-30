import React from 'react'
import { RaisedButton } from 'material-ui'

export default class WelcomeRaisedButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static PropTypes = { ...RaisedButton.propTypes }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, backgroundColor, labelColor, ...passProps } = this.props
    return (
      <RaisedButton
        {...passProps}
        style={{
          backgroundColor: 'transparent',
          border: '2px solid rgb(184, 184, 184)',
          boxShadow: 'none',
          ...style
        }}
        labelColor={labelColor || 'rgb(88, 83, 96)'}
        backgroundColor={backgroundColor || 'transparent'} />
    )
  }
}
