import PropTypes from 'prop-types'
import React from 'react'
import {Button} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasGem from '@fortawesome/fontawesome-pro-solid/faGem'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  root: {
    textAlign: 'center',
    marginBottom: 16,
    color: lightBlue[600],
    fontWeight: 300
  },
  proIcon: {
    fontSize: 20,
    marginRight: 8
  },
  deleteIcon: {
    marginRight: 6,
    verticalAlign: 'middle'
  }
}

@withStyles(styles)
class RestrictedServiceSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      classes,
      serviceId,
      ...passProps
    } = this.props

    return (
      <div {...passProps} className={classNames(className, classes.root)}>
        <p>
          Use and customize this service when purchasing Wavebox
        </p>
        <div>
          <Button variant='raised' color='primary' onClick={() => { window.location.hash = '/pro' }}>
            <FontAwesomeIcon icon={fasGem} className={classes.proIcon} />
            Purchase Wavebox
          </Button>
        </div>
      </div>
    )
  }
}

export default RestrictedServiceSection
