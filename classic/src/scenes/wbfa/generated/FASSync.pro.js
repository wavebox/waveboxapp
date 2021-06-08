import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/pro-solid-svg-icons/faSync'
export default class FASSync extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSync} />)
  }
}
