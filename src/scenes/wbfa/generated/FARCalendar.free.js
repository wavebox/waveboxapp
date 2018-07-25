import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-regular-svg-icons/faCalendar'
export default class FARCalendar extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCalendar} />)
  }
}
