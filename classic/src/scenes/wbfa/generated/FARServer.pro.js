import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faServer } from '@fortawesome/pro-regular-svg-icons/faServer'
export default class FARServer extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faServer} />)
  }
}
