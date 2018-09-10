import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
export default class FARSpinnerThird extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSpinner} />)
  }
}
