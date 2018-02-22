import React from 'react'
import PropTypes from 'prop-types'
import WebView from './WebView'
import shallowCompare from 'react-addons-shallow-compare'

const WEBVIEW_REF = 'webview'

export default class BrowserView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...WebView.propTypes,
    searchId: PropTypes.any.isRequired,
    searchTerm: PropTypes.string
  }
  static defaultProps = {
    searchId: `${Math.random()}`
  }
  static REACT_WEBVIEW_EVENTS = WebView.REACT_WEBVIEW_EVENTS
  static WEBVIEW_METHODS = [].concat(WebView.WEBVIEW_METHODS, ['getProcessMemoryInfo', 'sendWithResponse', 'getWebviewNode'])

  /* **************************************************************************/
  // Class Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    // Expose the pass-through methods
    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function () {
        return self.refs[WEBVIEW_REF][m].apply(self.refs[WEBVIEW_REF], Array.from(arguments))
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    // Push state down into webview on update
    const { searchTerm, searchId } = this.props

    // Search
    if (prevProps.searchTerm !== searchTerm) {
      if (searchTerm && searchTerm.length) {
        this.refs[WEBVIEW_REF].findInPage(searchTerm)
      } else {
        this.refs[WEBVIEW_REF].stopFindInPage('clearSelection')
      }
    } else if (prevProps.searchId !== searchId) {
      if (searchTerm && searchTerm.length) {
        this.refs[WEBVIEW_REF].findInPage(searchTerm, { findNext: true })
      }
    }
  }

  render () {
    const {...passProps} = this.props
    return (<WebView {...passProps} ref={WEBVIEW_REF} />)
  }
}
