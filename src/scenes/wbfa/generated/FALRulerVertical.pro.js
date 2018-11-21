import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRulerVertical } from '@fortawesome/pro-light-svg-icons/faRulerVertical'
export default class FALRulerVertical extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faRulerVertical} />)
  }
}
