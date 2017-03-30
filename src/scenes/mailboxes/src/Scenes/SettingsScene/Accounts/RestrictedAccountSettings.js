const React = require('react')
const {RaisedButton, FontIcon, FlatButton} = require('material-ui')
const TimerMixin = require('react-timer-mixin')
const { mailboxActions } = require('stores/mailbox')
const Colors = require('material-ui/styles/colors')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountSettings',
  propTypes: {
    mailboxId: React.PropTypes.string
  },
  mixins: [TimerMixin],

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.confirmingDeleteTO = null
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState({ confirmingDelete: false })
      this.clearTimeout(this.confirmingDeleteTO)
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      confirmingDelete: false
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the delete button being tapped
  */
  handleDeleteTapped (evt) {
    if (this.state.confirmingDelete) {
      mailboxActions.remove(this.props.mailbox.id)
    } else {
      this.setState({ confirmingDelete: true })
      this.confirmingDeleteTO = this.setTimeout(() => {
        this.setState({ confirmingDelete: false })
      }, 4000)
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, ...passProps } = this.props
    delete passProps.mailboxId

    return (
      <div {...passProps} style={Object.assign({ textAlign: 'center', marginBottom: 16 }, style)}>
        <p>
          Use and customize this account with Wavebox Pro
        </p>
        <div>
          <RaisedButton
            primary
            icon={(<FontIcon className='fa fa-diamond' />)}
            label='Wavebox Pro'
            onClick={() => { window.location.hash = '/pro' }} />
        </div>
        <br />
        <div>
          <FlatButton
            label={this.state.confirmingDelete ? 'Click again to confirm' : 'Delete this Account'}
            icon={<FontIcon color={Colors.red600} className='material-icons'>delete</FontIcon>}
            labelStyle={{color: Colors.red600}}
            onTouchTap={this.handleDeleteTapped} />
        </div>
      </div>
    )
  }
})
