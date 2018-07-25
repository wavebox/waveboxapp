import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus'
export default class FASMinus extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faMinus} />)
  }
}
