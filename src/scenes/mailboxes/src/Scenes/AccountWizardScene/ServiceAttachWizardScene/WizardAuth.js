import React from 'react'
import AuthenticationInstruction from 'wbui/AuthenticationInstruction'

export default class WizardAuth extends React.Component {
  render () {
    return (<AuthenticationInstruction {...this.props} />)
  }
}
