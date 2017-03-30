const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const Theme = require('shared/Components/Theme')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default
const BrowserScene = require('./BrowserScene')
const querystring = require('querystring')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ContentProvider',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {

  },

  componentWillUnmount () {

  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {

    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { url, partition } = querystring.parse(window.location.search.slice(1))

    return (
      <MuiThemeProvider muiTheme={Theme}>
        <BrowserScene url={url} partition={partition} />
      </MuiThemeProvider>
    )
  }
})
