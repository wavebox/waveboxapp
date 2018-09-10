import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareUp } from '@fortawesome/free-regular-svg-icons/faCaretSquareUp'
export default class FARArrowAltSquareUp extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCaretSquareUp} />)
  }
}
