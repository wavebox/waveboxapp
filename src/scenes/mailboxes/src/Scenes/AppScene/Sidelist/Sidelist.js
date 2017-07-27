import React from 'react'
import './Sidelist.less'
import SidelistMailboxes from './SidelistMailboxes'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistWindowControls from './SidelistWindowControls'
import SidelistControls from './SidelistControls'
import SidelistUpgradePlans from './SidelistUpgradePlans'
import * as Colors from 'material-ui/styles/colors'

const styles = {
  container: {
    backgroundColor: Colors.blueGrey900,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  mailboxes: {
    flexGrow: 10000,
    overflowY: 'auto'
  }
}

export default class Sidelist extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const userState = userStore.getState()
    return {
      showTitlebar: settingsState.launched.ui.showTitlebar,
      showPlans: userState.user.showPlansInSidebar
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      showPlans: userState.user.showPlansInSidebar
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showTitlebar, showPlans } = this.state
    const { style, ...passProps } = this.props

    return (
      <div {...passProps} style={{...styles.container, ...style}}>
        {!showTitlebar ? (<SidelistWindowControls />) : undefined}
        {showPlans ? (<SidelistUpgradePlans />) : undefined}
        <SidelistMailboxes style={styles.mailboxes} className='ReactComponent-Sidelist-Mailboxes' />
        <SidelistControls />
      </div>
    )
  }
}
