import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindow } from '@fortawesome/pro-regular-svg-icons/faWindow'
export default class FARWindow extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindow} />)
  }
}
