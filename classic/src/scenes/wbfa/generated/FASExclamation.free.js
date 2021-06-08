import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamation } from '@fortawesome/free-solid-svg-icons/faExclamation'
export default class FASExclamation extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faExclamation} />)
  }
}
