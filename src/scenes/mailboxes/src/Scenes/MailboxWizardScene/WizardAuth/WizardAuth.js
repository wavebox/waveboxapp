import React from 'react'
import { AuthenticationInstruction } from 'Components'

export default class WizardAuth extends React.Component {
  render () {
    return (<AuthenticationInstruction {...this.props} />)
  }
}
