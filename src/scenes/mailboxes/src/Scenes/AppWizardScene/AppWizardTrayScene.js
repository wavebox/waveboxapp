import React from 'react'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { TrayIconEditor } from 'Components/Tray'

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    textAlign: 'center'
  },
  heading: {
    fontWeight: 300,
    marginTop: 20
  },
  subHeading: {
    fontWeight: 300,
    marginTop: 0,
    fontSize: 16
  },
  trayHeading: {
    color: 'black'
  },
  trayPreview: {
    margin: '0px auto'
  },
  trayEditor: {
    textAlign: 'center'
  }
}

export default class AppWizardTrayScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      tray: settingsStore.getState().tray
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({ tray: settingsState.tray })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { tray } = this.state
    const naming = process.platform === 'darwin' ? 'Menu Bar' : 'Tray'

    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>{`${naming} Icon`}</h2>
        <p style={styles.subHeading}>
          {`The Wavebox ${naming} Icon sits alongside the other apps that
          are running in your ${naming}. You can change the way the Wavebox
          ${naming} Icon appears so it fits perfectly with everthing else`}
        </p>
        <TrayIconEditor
          tray={tray}
          style={styles.trayEditor}
          trayPreviewStyles={styles.trayPreview}
          trayHeadingStyles={styles.trayHeading} />
      </div>
    )
  }
}
