import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceInformationCover from '../ServiceInformationCover'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import RefreshIcon from '@material-ui/icons/Refresh'

const styles = {
  infoButtonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class ServiceCrashedCover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isCrashed: PropTypes.bool.isRequired,
    attemptUncrash: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isCrashed, attemptUncrash, classes, ...passProps } = this.props

    if (isCrashed) {
      return (
        <ServiceInformationCover
          {...passProps}
          title='Whoops!'
          text={['Something went wrong with this tab and it crashed']}
          button={(
            <Button variant='raised' onClick={attemptUncrash}>
              <RefreshIcon className={classes.infoButtonIcon} />
              Reload
            </Button>
          )} />
      )
    } else {
      return false
    }
  }
}

export default ServiceCrashedCover
