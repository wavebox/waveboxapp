import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListAlt } from '@fortawesome/free-solid-svg-icons/faListAlt'
export default class FASListAlt extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faListAlt} />)
  }
}
