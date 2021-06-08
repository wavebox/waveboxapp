import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/pro-regular-svg-icons/faQuestionCircle'
export default class FARQuestionCircle extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faQuestionCircle} />)
  }
}
