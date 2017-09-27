import React from 'react'
import { HashRouter, Route } from 'react-router-dom'
import AppScene from './AppScene'
import SettingsScene from './SettingsScene'
import DictionaryInstallerScene from './DictionaryInstallerScene'
import ComposePickerScene from './ComposePickerScene'
import ProScene from './ProScene'
import EarlyBuildToast from './EarlyBuildToast'
import MailboxWizardScene from './MailboxWizardScene'
import MailboxWizardAddScene from './MailboxWizardAddScene'
import MailboxReauthenticatingScene from './MailboxReauthenticatingScene'
import AppWizardScene from './AppWizardScene'
import NewsScene from './NewsScene'
import {
  CheckingUpdatesScene,
  UpdateAvailableScene,
  UpdateErrorScene,
  UpdateNoneScene
} from './UpdatesScene'
import {
  AccountMessageScene,
  AccountAuthScene,
  AccountAuthenticatingScene,
  AccountStandaloneScene
} from './AccountScene'
import SnapSetupScene from './SnapSetupScene'

export default class WaveboxRouter extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate () { return false }

  render () {
    return (
      <HashRouter>
        <div>
          <AppScene />
          <EarlyBuildToast />

          <Route path='/settings/:tab?/:tabArg?' component={SettingsScene} />

          <Route path='/dictionary_installer' component={DictionaryInstallerScene} />

          <Route path='/mailbox_wizard/add' component={MailboxWizardAddScene} />
          <Route path='/mailbox_wizard/:mailboxType/:accessMode/:step/:mailboxId?' component={MailboxWizardScene} />
          <Route path='/mailbox/reauthenticating' component={MailboxReauthenticatingScene} />

          <Route path='/app_wizard/:step?' component={AppWizardScene} />

          <Route path='/incoming/compose' component={ComposePickerScene} />

          <Route path='/updates/checking/:provider' component={CheckingUpdatesScene} />
          <Route path='/updates/none/:provider' component={UpdateNoneScene} />
          <Route path='/updates/error/:provider' component={UpdateErrorScene} />
          <Route path='/updates/install/:provider' component={UpdateAvailableScene} />
          <Route path='/updates/available/:provider' component={UpdateAvailableScene} />

          <Route path='/pro' component={ProScene} />
          <Route path='/news' component={NewsScene} />

          <Route path='/account/message' component={AccountMessageScene} />
          <Route path='/account/auth/:mode?' component={AccountAuthScene} />
          <Route path='/account/authenticating' component={AccountAuthenticatingScene} />
          <Route path='/account/view' component={AccountStandaloneScene} />

          <Route path='/snap/setup' component={SnapSetupScene} />
        </div>
      </HashRouter>
    )
  }
}
