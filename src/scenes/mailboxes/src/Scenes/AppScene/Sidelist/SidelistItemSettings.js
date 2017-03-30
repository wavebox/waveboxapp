const React = require('react')
const { IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const styles = require('./SidelistStyles')
const { basicPopoverStyles } = require('./SidelistPopoverStyles')
const ReactPortalTooltip = require('react-portal-tooltip')
const uuid = require('uuid')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemSettings',

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      generatedId: uuid.v4(),
      showTooltip: false
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const { style, ...passProps } = this.props
    const { showTooltip, generatedId } = this.state

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, style)}
        onMouseEnter={() => this.setState({ showTooltip: true })}
        onMouseLeave={() => this.setState({ showTooltip: false })}
        id={`ReactComponent-Sidelist-Item-Settings-${generatedId}`}>
        <IconButton
          iconClassName='material-icons'
          onClick={() => { window.location.hash = '/settings' }}
          iconStyle={{ color: Colors.blueGrey400 }}>
          settings
        </IconButton>
        <ReactPortalTooltip
          active={showTooltip}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='right'
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Item-Settings-${generatedId}`}>
          Settings
        </ReactPortalTooltip>
      </div>
    )
  }
})
