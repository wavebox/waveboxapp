import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt } from '@fortawesome/pro-solid-svg-icons/faExchangeAlt'
export default class FASExchangeAlt extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faExchangeAlt} />)
  }
}
