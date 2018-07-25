import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowRestore } from '@fortawesome/free-regular-svg-icons/faWindowRestore'
export default class FASWindowRestore extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowRestore} />)
  }
}
