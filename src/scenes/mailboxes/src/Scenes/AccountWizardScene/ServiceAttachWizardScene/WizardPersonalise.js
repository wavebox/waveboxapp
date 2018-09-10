import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'
import StyleMixins from 'wbui/Styles/StyleMixins'
import WizardPersonaliseGeneric from '../Common/WizardPersonalise/WizardPersonaliseGeneric'
import WizardPersonaliseContainer from '../Common/WizardPersonalise/WizardPersonaliseContainer'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 68,
    padding: 16,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    padding: 16,
    textAlign: 'right'
  },

  // Typography
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  },

  // Elements
  colorPicker: {
    display: 'inline-block',
    maxWidth: '100%'
  },
  servicesPurchaseContainer: {
    border: `2px solid ${lightBlue[500]}`,
    borderRadius: 4,
    padding: 16,
    display: 'block'
  },

  // Footer
  footerCancelButton: {
    marginRight: 8
  }
}

@withStyles(styles)
class WizardPersonalise extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceType: PropTypes.string.isRequired,
    accessMode: PropTypes.string.isRequired,
    onRequestNext: PropTypes.func.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.customPersonalizeRef = null
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user pressing next
  */
  handleNext = () => {
    if (this.customPersonalizeRef) {
      const { ok, serviceJS } = this.customPersonalizeRef.updateAttachingService({})
      if (ok) {
        this.props.onRequestNext(serviceJS)
      }
    } else {
      this.props.onRequestNext({})
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
      serviceType,
      accessMode,
      onRequestCancel,
      onRequestNext,
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <div {...passProps} className={classNames(classes.container, className)}>
        <div className={classes.body}>
          {serviceType === SERVICE_TYPES.GENERIC ? (
            <WizardPersonaliseGeneric
              innerRef={(n) => { this.customPersonalizeRef = n }}
              onRequestNext={this.handleNext}
              accessMode={accessMode} />
          ) : undefined}
          {serviceType === SERVICE_TYPES.CONTAINER ? (
            <WizardPersonaliseContainer
              innerRef={(n) => { this.customPersonalizeRef = n }}
              onRequestNext={this.handleNext}
              accessMode={accessMode} />
          ) : undefined}
        </div>
        <div className={classes.footer}>
          <Button className={classes.footerCancelButton} onClick={onRequestCancel}>
            Cancel
          </Button>
          <Button color='primary' variant='raised' onClick={this.handleNext}>
            Next
          </Button>
        </div>
      </div>
    )
  }
}

export default WizardPersonalise
