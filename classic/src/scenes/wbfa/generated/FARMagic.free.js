import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagic } from '@fortawesome/free-solid-svg-icons/faMagic'
export default class FARMagic extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faMagic} />)
  }
}
