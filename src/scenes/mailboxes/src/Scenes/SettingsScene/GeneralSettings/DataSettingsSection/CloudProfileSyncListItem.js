import React from 'react'
import { userStore, userActions } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from '@material-ui/core/styles'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import CheckIcon from '@material-ui/icons/Check'
import { ListItemText, Button } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import green from '@material-ui/core/colors/green'
import classNames from 'classnames'
import FASSyncIcon from 'wbfa/FASSync'
import FASCloudUploadIcon from 'wbfa/FASCloudUpload'
import FASCloudDownloadIcon from 'wbfa/FASCloudDownload'

const styles = {
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  buttonsContainer: {
    marginTop: 6,
    '&>*': {
      marginLeft: 4,
      marginRight: 4
    },
    '&>*:first-child': {
      marginLeft: 0
    },
    '&>*:last-child': {
      marginRight: 0
    }
  },
  icon: {
    marginRight: 6,
    width: 18,
    height: 18,
    verticalAlign: 'middle'
  },
  iconError: {
    color: red[700]
  },
  iconSuccess: {
    color: green[700]
  },
  iconProgress: {
    color: blue[700]
  }
}

@withStyles(styles)
class CloudProfileSyncListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {

  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    this.userProfileUploadShowStatusTO = null
    this.userProfilesFetchShowStatusTO = null
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    clearTimeout(this.userProfileUploadShowStatusTO)
    clearTimeout(this.userProfilesFetchShowStatusTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      userProfileUploadInflight: userState.userProfileUpload.inflight,
      userProfileUploadSuccess: !userState.userProfileUpload.inError,
      userProfileUploadShowStatus: false,
      userProfilesFetchInflight: userState.userProfilesFetch.inflight,
      userProfilesFetchSuccess: !userState.userProfilesFetch.inError,
      userProfilesFetchShowStatus: false,
      enableProfileSync: userState.user.enableProfileSync
    }
  })()

  userUpdated = (userState) => {
    this.setState((prevState) => {
      const delta = {
        userProfileUploadInflight: userState.userProfileUpload.inflight,
        userProfileUploadSuccess: !userState.userProfileUpload.inError,
        userProfilesFetchInflight: userState.userProfilesFetch.inflight,
        userProfilesFetchSuccess: !userState.userProfilesFetch.inError,
        enableProfileSync: userState.user.enableProfileSync
      }

      if (prevState.userProfileUploadShowStatus) {
        if (prevState.userProfileUploadInflight && !delta.userProfileUploadInflight) {
          clearTimeout(this.userProfileUploadShowStatusTO)
          this.userProfileUploadShowStatusTO = setTimeout(() => {
            this.setState({ userProfileUploadShowStatus: false })
          }, 2000)
        }
      }
      if (prevState.userProfilesFetchShowStatus) {
        if (prevState.userProfilesFetchInflight && !delta.userProfilesFetchInflight) {
          clearTimeout(this.userProfilesFetchShowStatusTO)
          this.userProfilesFetchShowStatusTO = setTimeout(() => {
            this.setState({ userProfilesFetchShowStatus: false })
          }, 2000)
        }
      }

      return delta
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, ...passProps } = this.props
    const {
      userProfileUploadInflight,
      userProfileUploadSuccess,
      userProfileUploadShowStatus,
      userProfilesFetchInflight,
      userProfilesFetchSuccess,
      userProfilesFetchShowStatus,
      enableProfileSync
    } = this.state

    // Render upload elements
    let uploadIcon
    let uploadText
    if (userProfileUploadShowStatus) {
      if (userProfileUploadInflight) {
        uploadText = 'Upload profile'
        uploadIcon = (
          <FASSyncIcon className={classNames(classes.icon, classes.iconProgress)} spin />
        )
      } else {
        if (userProfileUploadSuccess) {
          uploadText = 'Uploaded'
          uploadIcon = (
            <CheckIcon className={classNames(classes.icon, classes.iconSuccess)} />
          )
        } else {
          uploadText = 'Upload failure'
          uploadIcon = (
            <ErrorOutlineIcon className={classNames(classes.icon, classes.iconError)} />
          )
        }
      }
    } else {
      uploadText = 'Upload profile'
      uploadIcon = (
        <FASCloudUploadIcon className={classes.icon} />
      )
    }

    // Render restore elements
    let restoreIcon
    let restoreText
    if (userProfilesFetchShowStatus) {
      if (userProfilesFetchInflight) {
        restoreText = 'Restore profile'
        restoreIcon = (
          <FASSyncIcon className={classNames(classes.icon, classes.iconProgress)} spin />
        )
      } else {
        if (userProfilesFetchSuccess) {
          restoreText = 'Restore profile'
          restoreIcon = (
            <FASCloudDownloadIcon className={classes.icon} />
          )
        } else {
          restoreText = 'Restore failure'
          restoreIcon = (
            <ErrorOutlineIcon className={classNames(classes.icon, classes.iconError)} />
          )
        }
      }
    } else {
      restoreText = 'Restore profile'
      restoreIcon = (
        <FASCloudDownloadIcon className={classes.icon} />
      )
    }

    // Render the rest of the component
    return (
      <SettingsListItem className={classNames(classes.root, className)} {...passProps}>
        <ListItemText
          primary={(<strong>Cloud Profile Sync</strong>)}
          secondary={!enableProfileSync ? 'Profile sync has been disabled under your Wavebox account settings' : undefined} />
        <div className={classes.buttonsContainer}>
          <Button
            size='small'
            variant='raised'
            disabled={!enableProfileSync}
            onClick={() => {
              this.setState({ userProfileUploadShowStatus: true })
              userActions.uploadUserProfile()
            }}>
            {uploadIcon}
            {uploadText}
          </Button>
          <Button
            size='small'
            variant='raised'
            disabled={!enableProfileSync}
            onClick={() => {
              this.setState({ userProfilesFetchShowStatus: true })
              userActions.fetchUserProfiles(null, undefined, null)
            }}>
            {restoreIcon}
            {restoreText}
          </Button>
        </div>
      </SettingsListItem>
    )
  }
}

export default CloudProfileSyncListItem
