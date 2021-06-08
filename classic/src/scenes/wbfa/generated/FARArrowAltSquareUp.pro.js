import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltSquareUp } from '@fortawesome/pro-regular-svg-icons/faArrowAltSquareUp'
export default class FARArrowAltSquareUp extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowAltSquareUp} />)
  }
}
