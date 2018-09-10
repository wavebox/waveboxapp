import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSlack } from '@fortawesome/free-brands-svg-icons/faSlack'
export default class FABSlack extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSlack} />)
  }
}
