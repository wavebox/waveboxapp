import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
export default class FARBrowser extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSquare} />)
  }
}
