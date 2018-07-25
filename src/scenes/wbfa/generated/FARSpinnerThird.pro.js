import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinnerThird } from '@fortawesome/pro-regular-svg-icons/faSpinnerThird'
export default class FARSpinnerThird extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSpinnerThird} />)
  }
}
