import React from 'react'
import {
  DialogContent, DialogActions, DialogTitle,
  TextField, Button, Switch,
  FormControl, FormControlLabel
} from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import grey from '@material-ui/core/colors/grey'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import validUrl from 'valid-url'
import FileUploadButton from 'wbui/FileUploadButton'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'

const styles = {
  title: {
    padding: '12px 24px 12px 24px'
  },
  titleName: {
    color: grey[500]
  },
  dialogContent: {
    minWidth: 600,
    paddingBottom: 6
  },
  faviconGroup: {
    display: 'flex',
    marginTop: 12
  },
  favicon: {
    height: 36,
    width: 36,
    textIndent: -100000,
    border: '1px solid #EEE',
    backgroundImage: 'repeating-linear-gradient(45deg, #EEE, #EEE 2px, #FFF 2px, #FFF 5px)',
    marginRight: 12
  }
}

@withStyles(styles)
class BookmarkEditSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        serviceId: PropTypes.string.isRequired,
        bookmarkId: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    const changed = this.props.match.params.serviceId !== nextProps.match.params.serviceId ||
      this.props.match.params.bookmarkId !== nextProps.match.params.bookmarkId
    if (changed) {
      this.setState({
        ...this.generateAccountState(
          accountStore.getState(),
          nextProps.match.params.serviceId,
          nextProps.match.params.bookmarkId
        ),
        ...this.generateFreshChangeset()
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const { serviceId, bookmarkId } = this.props.match.params
    return {
      ...this.generateAccountState(accountStore.getState(), serviceId, bookmarkId),
      ...this.generateFreshChangeset()
    }
  })()

  accountChanged = (accountState) => {
    const { serviceId, bookmarkId } = this.props.match.params
    this.setState({
      ...this.generateAccountState(accountState, serviceId, bookmarkId)
    })
  }

  generateFreshChangeset () {
    return {
      bookmarkChangeset: { },
      bookmarkChangesetErrors: {
        url: false
      }
    }
  }

  generateAccountState (accountState, serviceId, bookmarkId) {
    const service = accountState.getService(serviceId)
    if (!service) { return { hasMembers: false } }
    const bookmark = service.getBookmarkWithId(bookmarkId)
    if (!bookmark) { return { hasMembers: false } }

    return {
      hasMembers: true,
      bookmark: bookmark
    }
  }

  /**
  * Updates the bookmark changeset
  * @param changeset: the changset to use
  */
  updateBookmarkChangeset (changeset) {
    this.setState((prevState) => {
      return {
        bookmarkChangeset: { ...prevState.bookmarkChangeset, ...changeset }
      }
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles the title changing
  * @param evt: the event
  */
  handleTitleChanged = (evt) => {
    this.updateBookmarkChangeset({ title: evt.target.value })
  }

  /**
  * Handles the url changing
  * @param evt: the event
  */
  handleUrlChanged = (evt) => {
    this.updateBookmarkChangeset({ url: evt.target.value })
  }

  /**
  * Handles the open in new window setting changing
  * @param evt: the event
  * @param toggled: true if toggled, false otherwise
  */
  handleOpenNewWindowChanged = (evt, toggled) => {
    this.updateBookmarkChangeset({
      windowType: toggled ? 'CONTENT' : 'MAIN'
    })
  }

  /**
  * Handles a new favicon being uploaded
  * @param evt: the event that fired
  */
  handleFaviconUpload = (evt) => {
    const fileRef = evt.target.files[0]
    if (!fileRef) { return }

    Promise.resolve()
      .then(() => FileUploadButton.loadAndFitImageBase64(fileRef, 64))
      .then((b64Image) => {
        this.updateBookmarkChangeset({ favicons: [b64Image] })
      })
      .catch(() => { /* no-op */ })
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /**
  * Saves the data and closes the modal
  */
  handleSave = () => {
    const { bookmarkChangeset } = this.state

    // Validate
    const bookmarkChangesetErrors = {}
    if (bookmarkChangeset.url !== undefined && !validUrl.isUri(bookmarkChangeset.url)) {
      bookmarkChangesetErrors.url = true
    }

    if (!Object.keys(bookmarkChangesetErrors).length) {
      const { serviceId, bookmarkId } = this.props.match.params
      accountActions.reduceService(
        serviceId,
        ServiceReducer.changeBookmark,
        bookmarkId,
        bookmarkChangeset
      )
      window.location.hash = '/'
    }
    this.setState({ bookmarkChangesetErrors })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const {
      hasMembers,
      bookmark,
      bookmarkChangeset,
      bookmarkChangesetErrors
    } = this.state

    if (!hasMembers) {
      window.location.hash = '/'
      return false
    }

    const editingBookmark = {
      ...bookmark,
      ...bookmarkChangeset
    }

    return (
      <React.Fragment>
        <DialogTitle className={classes.title}>
          {bookmark.title ? (
            <React.Fragment>
              Edit <span className={classes.titleName}>{bookmark.title}</span>
            </React.Fragment>
          ) : (
            `Edit Pinned Item`
          )}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder={bookmark.title || 'My Pinned Item'}
            label='Name'
            margin='normal'
            value={editingBookmark.title || ''}
            onChange={this.handleTitleChanged} />
          <div className={classes.faviconGroup}>
            <img className={classes.favicon} src={(editingBookmark.favicons || [])[0]} />
            <FileUploadButton accept='image/*' onChange={this.handleFaviconUpload} variant='contained'>
              Change Icon
            </FileUploadButton>
          </div>
          <TextField
            fullWidth
            type='url'
            InputLabelProps={{ shrink: true }}
            placeholder={bookmark.url || 'https://wavebox.io'}
            label='Url'
            margin='normal'
            error={bookmarkChangesetErrors.url}
            helperText={bookmarkChangesetErrors.url ? 'Enter a valid url' : undefined}
            value={editingBookmark.url || ''}
            onChange={this.handleUrlChanged} />
          <FormControl fullWidth>
            <FormControlLabel
              label='Open in New Window'
              control={(
                <Switch
                  checked={editingBookmark.windowType !== 'MAIN'}
                  color='primary'
                  onChange={this.handleOpenNewWindowChanged} />
              )} />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose}>
            Cancel
          </Button>
          <Button variant='contained' color='primary' onClick={this.handleSave}>
            Save
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default BookmarkEditSceneContent
