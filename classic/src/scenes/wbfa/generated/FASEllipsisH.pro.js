import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/pro-solid-svg-icons/faEllipsisH'
export default class FASEllipsisH extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faEllipsisH} />)
  }
}
