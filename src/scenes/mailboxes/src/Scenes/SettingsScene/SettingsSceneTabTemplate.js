import PropTypes from 'prop-types'
import React from 'react'

export default class SettingsSceneTabTemplate extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    selected: PropTypes.bool,
    style: PropTypes.object
  }

  render () {
    const { selected, ...passProps } = this.props

    return selected ? (
      <div {...passProps} />
    ) : false
  }
}
