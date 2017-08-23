import PropTypes from 'prop-types'
import React from 'react'
import {RaisedButton, FontIcon, FlatButton} from 'material-ui'
import { mailboxActions } from 'stores/mailbox'
import * as Colors from 'material-ui/styles/colors'

export default class RestrictedAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.confirmingDeleteTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.confirmingDeleteTO)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState({ confirmingDelete: false })
      clearTimeout(this.confirmingDeleteTO)
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      confirmingDelete: false
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the delete button being tapped
  */
  handleDeleteTapped = (evt) => {
    if (this.state.confirmingDelete) {
      mailboxActions.remove(this.props.mailbox.id)
    } else {
      this.setState({ confirmingDelete: true })
      clearTimeout(this.confirmingDeleteTO)
      this.confirmingDeleteTO = setTimeout(() => {
        this.setState({ confirmingDelete: false })
      }, 4000)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, ...passProps } = this.props
    delete passProps.mailboxId

    return (
      <div {...passProps} style={Object.assign({ textAlign: 'center', marginBottom: 16 }, style)}>
        <p>
          Use and customize this account when purchasing Wavebox
        </p>
        <div>
          <RaisedButton
            primary
            icon={(<FontIcon className='fa fa-diamond' />)}
            label='Purchase Wavebox'
            onClick={() => { window.location.hash = '/pro' }} />
        </div>
        <br />
        <div>
          <FlatButton
            label={this.state.confirmingDelete ? 'Click again to confirm' : 'Delete this Account'}
            icon={<FontIcon color={Colors.red600} className='material-icons'>delete</FontIcon>}
            labelStyle={{color: Colors.red600}}
            onClick={this.handleDeleteTapped} />
        </div>
      </div>
    )
  }
}
