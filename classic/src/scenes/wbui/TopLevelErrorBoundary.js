import React from 'react'
import { SUPPORT_URL } from 'shared/constants'
import pkg from 'package.json'
import WBRPCRenderer from 'shared/WBRPCRenderer'

// Stick to inline styles here to reduce dependencies for this
const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: '#f7f7f7',
    color: 'rgb(167, 171, 169)'
  },
  title: {
    marginBottom: 0,
    fontWeight: 300,
    fontSize: '26px'
  },
  subtitle: {
    marginTop: 0,
    fontWeight: 300
  },
  button: {
    display: 'inline-block',
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: 'white',
    border: '1px solid #c7c7c7',
    borderRadius: 3,
    padding: '4px 16px',
    fontSize: '14px'
  },
  buttonPrimary: {
    backgroundColor: '#1976D2',
    color: 'white',
    borderColor: 'transparent'
  },
  errorString: {
    maxHeight: 500,
    overflow: 'auto',
    border: '1px solid #c7c7c7',
    borderRadius: 5,
    padding: 5
  }
}

class TopLevelErrorBoundary extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidCatch (error, info) {
    console.error('[TopLevelErrorBoundary]', error, info)
    this.setState({ error: { error, info } })
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = {
    error: null,
    showError: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles reload
  */
  handleReload = () => {
    this.setState({
      error: null,
      showError: false
    })
  }

  /**
  * Handles sending a bug report
  */
  handleSendBugReport = () => {
    const report = [
      '\n\n',
      'ADD ANY EXTRA INFO ABOVE THIS LINE',
      '--- Error Report ---',
      this.renderErrorString(this.state.error)
    ].join('\n')
    const url = [
      SUPPORT_URL,
      SUPPORT_URL.indexOf('?') === -1 ? '?' : '&',
      'support_message=' + encodeURIComponent(report),
      '&app_version=' + encodeURIComponent(pkg.version)
    ].join('')

    WBRPCRenderer.wavebox.openExternal(url)
  }

  handleShowError = () => {
    this.setState((prevState) => {
      return { showError: !prevState.showError }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the error info
  * @param error: the error object to render
  * @return the error as a single string
  */
  renderErrorString (error) {
    try {
      const cmp = window.location.pathname.split('/')
      return [
        `${cmp[cmp.length - 1]}\n${(error.error || {}).message}`,
        `${(error.error || {}).stack}`,
        `TopLevelErrorBoundary\n${(error.info || {}).componentStack}`
      ].join('\n\n')
    } catch (ex) {
      return ''
    }
  }

  render () {
    const { error, showError } = this.state
    if (error) {
      return (
        <div style={styles.root}>
          <h3 style={styles.title}>Whoops!</h3>
          <p style={styles.subtitle}>Something went wrong</p>

          <div>
            <button style={styles.button} onClick={this.handleShowError}>
              {showError ? 'Hide Error' : 'Show Error'}
            </button>
            <button style={styles.button} onClick={this.handleSendBugReport}>
              Submit bug report
            </button>
            <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={this.handleReload}>
              Reload
            </button>
          </div>
          {showError ? (
            <pre style={styles.errorString}>
              {this.renderErrorString(error)}
            </pre>
          ) : undefined}
        </div>
      )
    } else {
      return this.props.children
    }
  }
}

export default TopLevelErrorBoundary
