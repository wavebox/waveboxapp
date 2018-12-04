import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRulerVertical } from '@fortawesome/pro-solid-svg-icons/faRulerVertical'
export default class FASRulerVertical extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faRulerVertical} />)
  }
}
