import React from 'react'
import PropTypes from 'prop-types'
import { HashRouter, Switch, Route } from 'react-router-dom'
import { RouterDialogRoute } from 'wbui/RouterDialog'
import settingsActions from 'stores/settings/settingsActions'
import WaveboxRouterErrorBoundary from 'wbui/WaveboxRouter/WaveboxRouterErrorBoundary'
import WaveboxRouterNoMatch from 'wbui/WaveboxRouter/WaveboxRouterNoMatch'
import ErrorBoundary from 'wbui/ErrorBoundary'
import KeyboardQuitSnackbarHelper from 'wbui/KeyboardQuitSnackbarHelper'
import ULinkORScene from './ULinkORScene'
import BrowserScene from './BrowserScene'

export default class WaveboxRouter extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string.isRequired,
    partition: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate () { return false }

  render () {
    const { url, partition } = this.props

    return (
      <HashRouter>
        <div>
          <BrowserScene url={url} partition={partition} />

          <ErrorBoundary>
            <KeyboardQuitSnackbarHelper
              onRequestAlwaysQuitImmediately={() => settingsActions.sub.ui.setWarnBeforeKeyboardQuitting(false)} /> />
          </ErrorBoundary>

          {/* Dialogs: link open */}
          <WaveboxRouterErrorBoundary>
            <ULinkORScene routeName='ulinkor_ask' />
          </WaveboxRouterErrorBoundary>

          {/* Routes */}
          <WaveboxRouterErrorBoundary>
            <Switch>
              {/* Dialogs: Links */}
              <RouterDialogRoute path='/link/open/:requestId' routeName='ulinkor_ask' />

              <Route path='/keyboardtarget' render={() => { return false }} />

              <Route component={WaveboxRouterNoMatch} />
            </Switch>
          </WaveboxRouterErrorBoundary>
        </div>
      </HashRouter>
    )
  }
}
