import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks'
export default class FASTasks extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faTasks} />)
  }
}
