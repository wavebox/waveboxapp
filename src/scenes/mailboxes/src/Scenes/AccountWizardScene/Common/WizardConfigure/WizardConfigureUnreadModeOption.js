import React from 'react'
import PropTypes from 'prop-types'
import uuid from 'uuid'
import shallowCompare from 'react-addons-shallow-compare'
import ReactPortalTooltip from 'react-portal-tooltip'
import { withStyles } from '@material-ui/core/styles'
import FARCheckIcon from 'wbfa/FARCheck'

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
    style: {
      background: 'rgba(255, 255, 255, 0.9)',
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: '13px',
      color: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1501
    },
    arrowStyle: {
      color: 'rgba(255, 255, 255, 0.9)',
      borderColor: false
    }
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
    hovering: false,
    generatedId: uuid.v4()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { color, selected, onSelected, name, popoverContent, classes, ...passProps } = this.props
    const { hovering, generatedId } = this.state

    return (
      <div {...passProps}>
        <div
          id={`ReactComponent-WizardConfigureUnreadModeOption-${generatedId}`}
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
        <ReactPortalTooltip
          active={hovering}
          tooltipTimeout={0}
          style={styles.popover}
          position='bottom'
          arrow='center'
          group={generatedId}
          parent={`#ReactComponent-WizardConfigureUnreadModeOption-${generatedId}`}>
          {popoverContent}
        </ReactPortalTooltip>
      </div>
    )
  }
}

export default WizardConfigureUnreadModeOption
