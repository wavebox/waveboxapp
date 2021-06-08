import React from 'react'
import { Button, DialogContent, DialogActions } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { NEWS_URL } from 'shared/constants'
import { settingsActions } from 'stores/settings'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
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
class NewsSceneContent extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsActions.openAndMarkNews.defer()

    // Hopefully fixes an issue where the webview fails to render any content https://github.com/electron/electron/issues/8505
    setTimeout(() => { this.setState({ renderWebview: true }) }, 100)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    renderWebview: false,
    isLoading: true
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { renderWebview, isLoading } = this.state

    return (
      <React.Fragment>
        <DialogContent className={classes.dialogContent}>
          {isLoading ? (
            <div className={classes.loadingCover}>
              <Spinner size={50} color={lightBlue[600]} speed={0.75} />
            </div>
          ) : undefined}
          {renderWebview ? (
            <WaveboxWebView
              didStartLoading={() => this.setState({ isLoading: true })}
              didStopLoading={() => this.setState({ isLoading: false })}
              src={NEWS_URL} />
          ) : undefined}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant='contained' color='primary' onClick={this.handleClose}>
            Close
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default NewsSceneContent
