import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRulerVertical } from '@fortawesome/free-solid-svg-icons/faRulerVertical'
export default class FARRulerVertical extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faRulerVertical} />)
  }
}
