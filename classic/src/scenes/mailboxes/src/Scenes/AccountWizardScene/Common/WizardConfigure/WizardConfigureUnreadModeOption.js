import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import FARCheckIcon from 'wbfa/FARCheck'
import { Tooltip } from '@material-ui/core'

const styles = {
  container: {
    textAlign: 'center',
    cursor: 'pointer',
    width: 140
  },
  option: {
    borderRadius: '50%',
    width: 80,
    height: 80,
    lineHeight: '80px',
    border: '4px solid white',
    margin: '0px auto'
  },
  selectedIcon: {
    fontSize: 40,
    color: 'white',
    verticalAlign: 'middle',
    marginTop: -10
  },
  name: {
    marginTop: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 14
  },
  popover: {
    background: 'rgb(255, 255, 255)',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: '13px',
    color: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1501
  }
}

@withStyles(styles)
class WizardConfigureUnreadModeOption extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    onSelected: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    popoverContent: PropTypes.element.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    hovering: false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { color, selected, onSelected, name, popoverContent, classes, ...passProps } = this.props
    const { hovering } = this.state

    return (
      <div {...passProps}>
        <Tooltip
          classes={{ tooltip: classes.popover }}
          placement='bottom'
          title={popoverContent}>
          <div
            className={classes.container}
            onMouseEnter={() => this.setState({ hovering: true })}
            onMouseLeave={() => this.setState({ hovering: false })}
            onClick={onSelected}>
            <div style={{ ...styles.option, backgroundColor: color, borderColor: hovering ? color : 'white' }}>
              {selected ? (
                <FARCheckIcon className={classes.selectedIcon} />
              ) : undefined}
            </div>
            <div className={classes.name}>{name}</div>
          </div>
        </Tooltip>
      </div>
    )
  }
}

export default WizardConfigureUnreadModeOption
