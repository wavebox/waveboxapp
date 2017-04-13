const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const styles = require('../SettingStyles')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountHeading',
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
    const { mailbox, ...passProps } = this.props

    return (
      <div {...passProps}>
        <h1 style={styles.heading}>Account</h1>
        <p style={styles.headingInfo}>
          <strong>{mailbox.humanizedType}</strong> {mailbox.displayName}
        </p>
      </div>
    )
  }
})
