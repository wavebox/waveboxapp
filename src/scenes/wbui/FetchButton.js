import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'

export default class FetchButton extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...Button.propTypes,
    content: PropTypes.node.isRequired,
    fetchContent: PropTypes.node.isRequired,
    successContent: PropTypes.node,
    failureContent: PropTypes.node,
    successDisplayMs: PropTypes.number.isRequired,
    failureDisplayMs: PropTypes.number.isRequired,
    disableOnFetch: PropTypes.bool.isRequired,
    disableClickOnFetch: PropTypes.bool.isRequired,
    fetchState: PropTypes.oneOf(['normal', 'fetching', 'success', 'failure'])
  }

  static defaultProps = {
    successDisplayMs: 2000,
    failureDisplayMs: 2000,
    disableOnFetch: false,
    disableClickOnFetch: true
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.intermediaryDisplayTO = null
  }

  componentDidMount () {
    this.fetchStateChanged(this.props)
  }

  componentWillUnmount () {
    clearTimeout(this.intermediaryDisplayTO)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.fetchState !== nextProps.fetchState) {
      this.fetchStateChanged(nextProps)
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    displayFetchState: this.props.fetchState
  }

  /**
  * Sets up and tears down the fetch state - only pass on actual change
  * @param props: the props to use to update the state
  */
  fetchStateChanged (props) {
    if (props.fetchState === 'normal') {
      clearTimeout(this.intermediaryDisplayTO)
      this.setState({ displayFetchState: 'normal' })
    } else if (props.fetchState === 'fetching') {
      clearTimeout(this.intermediaryDisplayTO)
      this.setState({ displayFetchState: 'fetching' })
    } else if (props.fetchState === 'failure') {
      clearTimeout(this.intermediaryDisplayTO)
      this.intermediaryDisplayTO = setTimeout(() => {
        this.setState({ displayFetchState: 'normal' })
      }, props.failureDisplayMs)
      this.setState({ displayFetchState: 'failure' })
    } else if (props.fetchState === 'success') {
      clearTimeout(this.intermediaryDisplayTO)
      this.intermediaryDisplayTO = setTimeout(() => {
        this.setState({ displayFetchState: 'normal' })
      }, props.successDisplayMs)
      this.setState({ displayFetchState: 'success' })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      content,
      fetchContent,
      successContent,
      failureContent,
      successDisplayMs,
      failureDisplayMs,
      fetchState,
      children,
      disableOnFetch,
      disableClickOnFetch,
      disabled,
      onClick,
      ...passProps
    } = this.props
    const { displayFetchState } = this.state

    let renderContent
    if (displayFetchState === 'normal') {
      renderContent = content
    } else if (displayFetchState === 'fetching') {
      renderContent = fetchContent
    } else if (displayFetchState === 'failure') {
      renderContent = failureContent || content
    } else if (displayFetchState === 'success') {
      renderContent = successContent || content
    }

    return (
      <Button
        disabled={displayFetchState === 'fetching' && disableOnFetch ? true : disabled}
        onClick={displayFetchState === 'fetching' && disableClickOnFetch ? undefined : onClick}
        {...passProps}>
        {renderContent}
        {children}
      </Button>
    )
  }
}
