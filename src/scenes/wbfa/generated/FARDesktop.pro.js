import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop } from '@fortawesome/pro-regular-svg-icons/faDesktop'
export default class FARDesktop extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faDesktop} />)
  }
}
