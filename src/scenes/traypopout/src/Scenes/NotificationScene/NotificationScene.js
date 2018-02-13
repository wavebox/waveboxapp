import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'

export default class UnreadScene extends React.Component {
  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {

    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <div {...this.props}>Notification</div>
    )
  }
}
