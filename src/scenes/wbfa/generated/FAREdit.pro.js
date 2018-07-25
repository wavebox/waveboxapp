import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/pro-regular-svg-icons/faEdit'
export default class FAREdit extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faEdit} />)
  }
}
