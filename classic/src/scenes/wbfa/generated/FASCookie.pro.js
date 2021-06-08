import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCookie } from '@fortawesome/pro-solid-svg-icons/faCookie'
export default class FASCookie extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCookie} />)
  }
}
