import './AppScene.less'
import React from 'react'
import PropTypes from 'prop-types'
import MailboxTabManager from './Mailbox/MailboxTabManager'
import Sidelist from './Sidelist'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsStore } from 'stores/settings'

const SIDEBAR_WIDTH = 70
const styles = {
  master: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 'auto',
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 100,
    WebkitAppRegion: 'drag'
  },
  detail: {
    position: 'fixed',
    top: 0,
    left: SIDEBAR_WIDTH,
    right: 0,
    bottom: 0
  }
}

export default class AppScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsDidUpdate)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsDidUpdate)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      sidebar: settingsState.ui.sidebarEnabled
    }
  })()

  settingsDidUpdate = (settingsState) => {
    this.setState({
      sidebar: settingsState.ui.sidebarEnabled
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { sidebar } = this.state

    return (
      <div>
        {sidebar ? (
          <div style={styles.master}>
            <Sidelist />
          </div>
        ) : undefined}
        <div style={Object.assign({}, styles.detail, sidebar ? undefined : { left: 0 })}>
          <MailboxTabManager />
        </div>
        {this.props.children}
      </div>
    )
  }
}
