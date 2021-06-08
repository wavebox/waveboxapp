import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceInformationCover from '../ServiceInformationCover'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import HotelIcon from '@material-ui/icons/Hotel'
import AlarmIcon from '@material-ui/icons/Alarm'

const styles = {
  infoButtonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class ServiceSleepingCover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onAwakenService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, onAwakenService, ...passProps } = this.props

    return (
      <ServiceInformationCover
        {...passProps}
        IconComponent={HotelIcon}
        title='Shhhh!'
        text={['This tab is currently sleeping']}
        button={(
          <Button variant='contained' onClick={onAwakenService}>
            <AlarmIcon className={classes.infoButtonIcon} />
            Wake it up
          </Button>
        )} />
    )
  }
}

export default ServiceSleepingCover
