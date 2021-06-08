import React from 'react'

export default class WaveboxRouterErrorBoundary extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidCatch (error, info) {
    console.error('[WaveboxRouterErrorBoundary]', error, info)
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return this.props.children
  }
}
