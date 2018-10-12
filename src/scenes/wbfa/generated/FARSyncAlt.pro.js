import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/pro-regular-svg-icons/faSyncAlt'
export default class FARSyncAlt extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSyncAlt} />)
  }
}
