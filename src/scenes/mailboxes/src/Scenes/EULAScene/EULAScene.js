import './EULAScene.less'

const React = require('react')
const { Dialog, RaisedButton, FontIcon } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const { settingsStore, settingsActions } = require('stores/settings')

const styles = {
  // Layout
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(184, 237, 148)',
    overflow: 'hidden',
    flexDirection: 'column'
  },

  // Intro
  introGroup: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    textAlign: 'center'
  },
  introGroupImage: {
    flexGrow: 1,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: 'url("../../icons/app.svg")'
  },
  introGroupTitle: {
    margin: 0,
    fontWeight: '300'
  },
  introGroupSubtitle: {
    margin: 0,
    fontWeight: '300'
  },

  // EULA
  eulaGroup: {
    flexGrow: 1,
    position: 'relative'
  },
  eulaGroupFrameContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16
  },
  eulaGroupFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: 'white'
  },

  // Actions
  actionGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 16
  },
  actionGroupButton: {
    display: 'block'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'EULAScene',

  /* **************************************************************************/
  // Component Lifecyle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
    setTimeout(() => { this.setState({ fadeClass: true }) })
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const hasAgreed = settingsStore.getState().app.hasAgreedToEULA
    return {
      hasAgreedToEULA: hasAgreed,
      render: !hasAgreed,
      fadeClass: false
    }
  },

  settingsUpdated (settingsState) {
    this.setState((prevState) => {
      const hasAgreed = settingsState.app.hasAgreedToEULA
      if (prevState.hasAgreedToEULA !== hasAgreed && hasAgreed) {
        setTimeout(() => {
          this.setState({ render: false })
        }, 500)
        return { hasAgreedToEULA: hasAgreed }
      }
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { render, hasAgreedToEULA, fadeClass } = this.state
    if (!render) { return false }

    const groupClassNames = Array(3).fill(0)
      .map((u, index) => {
        return [
          'ReactComponent-EULADialog-IntroGroup',
          'ReactComponent-Group-' + (index + 1),
          fadeClass ? 'ReactComponent-Group-In' : undefined
        ].filter((c) => !!c).join(' ')
      })

    return (
      <Dialog
        modal
        bodyClassName='ReactComponent-EULADialog-Body'
        style={{ zIndex: 2000 }}
        className='ReactComponent-EULADialog'
        overlayStyle={{ backgroundColor: 'rgb(33,33,33)' }}
        contentStyle={{ width: '90%', maxWidth: 900 }}
        open={!hasAgreedToEULA}>
        <div style={styles.container}>
          <div style={styles.introGroup} className={groupClassNames[0]}>
            <div style={styles.introGroupImage} />
            <h1 style={styles.introGroupTitle}>Welcome to Wavebox</h1>
            <p style={styles.introGroupSubtitle}>
              the open-source desktop client for all your communication needs
            </p>
          </div>
          <div style={styles.eulaGroup} className={groupClassNames[1]}>
            <div style={styles.eulaGroupFrameContainer}>
              <iframe style={styles.eulaGroupFrame} src='eula.html' />
            </div>
          </div>
          <div style={styles.actionGroup} className={groupClassNames[2]}>
            <RaisedButton
              style={styles.actionGroupButton}
              icon={(<FontIcon className='material-icons'>highlight_off</FontIcon>)}
              onClick={() => settingsActions.declineEULA()}
              label='Decline' />
            <RaisedButton
              primary
              style={styles.actionGroupButton}
              icon={(<FontIcon className='material-icons'>check_circle</FontIcon>)}
              onClick={() => settingsActions.acceptEULA()}
              label='Accept' />
          </div>
        </div>
      </Dialog>
    )
  }
})
