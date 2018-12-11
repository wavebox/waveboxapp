import React from 'react'

const NO_MATCH_HASHES = new Set(['', '#', '#/'])

export default class WaveboxRouterNoMatch extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    // Ensure the url goes back to / on no match as we use this for copy and paste target detection
    if (!NO_MATCH_HASHES.has(window.location.hash)) {
      window.location.hash = '/'
    }

    return false
  }
}
