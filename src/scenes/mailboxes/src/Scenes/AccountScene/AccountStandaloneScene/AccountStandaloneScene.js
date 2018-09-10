import PropTypes from 'prop-types'
import React from 'react'
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import querystring from 'querystring'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  },
  loadingCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

@withStyles(styles)
class AccountStandaloneScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    location: PropTypes.shape({
      search: PropTypes.string
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }
  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      billingUrl: userStore.getState().user.billingUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({ billingUrl: userState.user.billingUrl })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, billingUrl } = this.state
    const { location, classes } = this.props
    const url = querystring.parse(location.search.substr(1)).url || billingUrl

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          <WaveboxWebView
            hasToolbar
            src={url} />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant='raised' color='primary' onClick={this.handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default AccountStandaloneScene
