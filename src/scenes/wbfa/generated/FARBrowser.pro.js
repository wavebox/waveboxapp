import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrowser } from '@fortawesome/pro-regular-svg-icons/faBrowser'
export default class FARBrowser extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faBrowser} />)
  }
}
