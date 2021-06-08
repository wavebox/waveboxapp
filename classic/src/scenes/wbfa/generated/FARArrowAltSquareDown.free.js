import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareDown } from '@fortawesome/free-regular-svg-icons/faCaretSquareDown'
export default class FARArrowAltSquareDown extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCaretSquareDown} />)
  }
}
