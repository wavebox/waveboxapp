import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListAlt } from '@fortawesome/pro-solid-svg-icons/faListAlt'
export default class FASListAlt extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faListAlt} />)
  }
}
