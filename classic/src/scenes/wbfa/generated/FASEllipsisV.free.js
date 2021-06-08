import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV'
export default class FASEllipsisV extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faEllipsisV} />)
  }
}
