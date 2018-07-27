import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { guestStore, guestActions } from 'stores/guest'

const styles = {
  dialog: {
    maxWidth: 600,
    width: 600,
    minWidth: 600
  },
  dialogContent: {
    width: 600,
    padding: '0 12px 12px'
  },
  // Heading
  dialogHeading: {
    marginTop: 0,
    marginBottom: 0
  },
  dialogSubheading: {
    marginTop: 0,
    marginBottom: 0
  }
}

@withStyles(styles)
class SitePermissionsScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    guestStore.listen(this.guestStoreChanged)
  }

  componentWillUnmount () {
    guestStore.unlisten(this.guestStoreChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const guestState = guestStore.getState()
    return {
      open: true,
      permissionSites: guestState.getPermissionSites().map((site) => {
        return [site, guestState.getPermissionRec(site)]
      })
    }
  })()

  guestStoreChanged = (guestState) => {
    this.setState({
      permissionSites: guestState.getPermissionSites().map((site) => {
        return [site, guestState.getPermissionRec(site)]
      })
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

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
    const { classes } = this.props
    const { open, permissionSites } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogTitle disableTypography>
          <h3 className={classes.dialogHeading}>Site permissions</h3>
          <p className={classes.dialogSubheading}>
            When a site requests a privileged permission if you choose
            to allow or deny the permission it will appear here
          </p>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List>
            {permissionSites.length ? permissionSites.map(([site, rec]) => {
              const recStr = Object.keys(rec).map((type) => {
                return `${type}: ${rec[type] ? 'granted' : 'denied'}`
              }).join(', ')
              return (
                <ListItem key={site}>
                  <ListItemText primary={site} secondary={recStr} />
                  <ListItemSecondaryAction>
                    <Button
                      variant='outlined'
                      onClick={() => guestActions.clearSitePermissions(site)}>
                      Reset
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            }) : (
              <ListItem>
                <ListItemText primary={`You don't have any special permissions for any sites`} />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button variant='raised' color='primary' onClick={this.handleClose}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default SitePermissionsScene
