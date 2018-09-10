import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    backgroundColor: '#f7f7f7',
    color: 'rgb(167, 171, 169)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    cursor: 'default',
    fontWeight: 300
  },
  icon: {
    color: 'rgb(167, 171, 169)',
    fontSize: '75px'
  },
  title: {
    fontWeight: 300
  },
  text: {
    marginBottom: 5,
    marginTop: 0
  },
  buttonContainer: {
    marginTop: 15
  }
}

@withStyles(styles)
class ServiceInformationCover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    IconComponent: PropTypes.any,
    iconClassName: PropTypes.string,
    title: PropTypes.string.isRequired,
    text: PropTypes.array.isRequired,
    button: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      className,
      classes,
      IconComponent,
      iconClassName,
      title,
      text,
      button,
      ...passProps
    } = this.props

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        {IconComponent ? (
          <IconComponent className={classNames(classes.icon, iconClassName)} />
        ) : undefined}
        <h1 className={classes.title}>{title}</h1>
        {(text || []).map((t, i) => {
          if (t) {
            return (<p key={`t-${i}`} className={classes.text}>{t}</p>)
          } else {
            return (<br key={`t-${i}`} />)
          }
        })}
        {button ? (
          <div className={classes.buttonContainer}>
            {button}
          </div>
        ) : undefined}
      </div>
    )
  }
}

export default ServiceInformationCover
