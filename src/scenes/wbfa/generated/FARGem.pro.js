import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGem } from '@fortawesome/pro-regular-svg-icons/faGem'
export default class FARGem extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faGem} />)
  }
}
