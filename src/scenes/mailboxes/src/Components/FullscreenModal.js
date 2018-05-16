import PropTypes from 'prop-types'
import React from 'react'
import { Dialog } from 'material-ui' //TODO

//TODO depricate?
export default class MailboxWizardScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  static propTypes = {
    ...Dialog.propTypes,
    borderWidth: PropTypes.number.isRequired
  }

  static defaultProps = {
    borderWidth: 25
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.hideTimeout = null
    if (this.props.open) {
      clearTimeout(this.hideTimeout)
      this.hideTimeout = setTimeout(() => {
        this.setState({ hidden: false })
      })
    }
  }

  componentWillUnmount () {
    clearTimeout(this.hideTimeout)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      if (nextProps.open) {
        clearTimeout(this.hideTimeout)
        this.hideTimeout = setTimeout(() => {
          this.setState({ hidden: false })
        })
      } else {
        clearTimeout(this.hideTimeout)
        this.hideTimeout = setTimeout(() => {
          this.setState({ hidden: true })
        })
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    hidden: true
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { borderWidth, contentStyle, bodyStyle, paperProps, autoScrollBodyContent, ...passProps } = this.props
    const { hidden } = this.state

    return (
      <Dialog
        {...passProps}
        contentStyle={{
          position: 'absolute',
          top: borderWidth,
          left: borderWidth,
          right: borderWidth,
          bottom: borderWidth,
          marginLeft: 0,
          marginRight: 0,
          marginBottom: 0,
          marginTop: hidden ? (-2 * borderWidth) : 0,
          transform: hidden ? 'translateY(-100%)' : 'translateY(0px)',
          width: 'auto',
          maxWidth: 'none',
          ...contentStyle
        }}
        bodyStyle={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          overflowX: autoScrollBodyContent ? 'auto' : 'hidden',
          ...bodyStyle
        }}
        paperProps={{
          ...paperProps,
          style: {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            ...(paperProps || {}).style
          }
        }}
        repositionOnUpdate={false}
        autoScrollBodyContent={false}
        autoDetectWindowHeight={false} />
    )
  }
}
