import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagic } from '@fortawesome/pro-solid-svg-icons/faMagic'
export default class FASMagic extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faMagic} />)
  }
}
