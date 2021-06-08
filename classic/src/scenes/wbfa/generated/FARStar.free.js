import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-regular-svg-icons/faStar'
export default class FARStar extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faStar} />)
  }
}
