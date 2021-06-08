import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch'
export default class FASSpinnerThird extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCircleNotch} />)
  }
}
