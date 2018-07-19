import PropTypes from 'prop-types'
import React from 'react'
import TrayRenderer from './TrayRenderer'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  preview: {
    backgroundImage: 'linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC), linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC)',
    backgroundSize: '30px 30px',
    backgroundPosition: '0 0, 15px 15px',
    boxShadow: 'inset 0px 0px 10px 0px rgba(0,0,0,0.75)'
  }
}

@withStyles(styles)
class TrayPreview extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tray: PropTypes.object.isRequired,
    size: PropTypes.number.isRequired,
    unreadCount: PropTypes.number
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    const { size, tray, unreadCount } = this.props
    TrayRenderer.renderPNGDataImage(size, tray, unreadCount, false)
      .then((png) => this.setState({ image: png }))
  }

  componentWillReceiveProps (nextProps) {
    if (shallowCompare(this, nextProps, this.state)) {
      TrayRenderer.renderPNGDataImage(nextProps.size, nextProps.tray, nextProps.unreadCount, false)
        .then((png) => this.setState({ image: png }))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return { image: null }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { size, style, className, classes, ...passProps } = this.props
    delete passProps.unreadCount
    delete passProps.tray
    const { image } = this.state

    return (
      <div
        {...passProps}
        style={{ width: size + 20, height: size + 20, ...style }}
        className={classNames(className, classes.preview)}>
        {!image ? undefined : (
          <img
            src={image}
            width={size + 'px'}
            height={size + 'px'}
            style={{ margin: 10 }} />
        )}
      </div>
    )
  }
}

export default TrayPreview
