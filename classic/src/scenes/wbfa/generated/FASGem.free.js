import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGem } from '@fortawesome/free-solid-svg-icons/faGem'
export default class FASGem extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faGem} />)
  }
}
