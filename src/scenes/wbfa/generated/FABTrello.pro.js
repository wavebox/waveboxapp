import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrello } from '@fortawesome/free-brands-svg-icons/faTrello'
export default class FABTrello extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faTrello} />)
  }
}
