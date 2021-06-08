import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltSquareDown } from '@fortawesome/pro-regular-svg-icons/faArrowAltSquareDown'
export default class FARArrowAltSquareDown extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowAltSquareDown} />)
  }
}
