const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const styles = require('../SettingStyles')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountServicesHeading',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { ...passProps } = this.props
    delete passProps.mailbox

    return (
      <div {...passProps}>
        <h1 style={styles.heading}>Services</h1>
        <p style={styles.headingInfo}>
          This account is split into seperate services, for example Email,
          Storage &amp; Contacts. You can enable, disable &amp; change the
          way these services behave below
        </p>
      </div>
    )
  }
})
