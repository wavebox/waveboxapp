import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinnerThird } from '@fortawesome/pro-solid-svg-icons/faSpinnerThird'
export default class FASSpinnerThird extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSpinnerThird} />)
  }
}
