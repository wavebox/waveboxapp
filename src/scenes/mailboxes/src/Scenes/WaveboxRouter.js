import React from 'react'
import { HashRouter, Route } from 'react-router-dom'
import AppScene from './AppScene'
import SettingsScene from './SettingsScene'
import DictionaryInstallerScene from './DictionaryInstallerScene'
import ComposePickerScene from './ComposePickerScene'
import ProScene from './ProScene'
import EULAScene from './EULAScene'
import EarlyBuildToast from './EarlyBuildToast'
import {
  MailboxWizardAddScene,
  MailboxWizardCompleteScene,
  MailboxWizardAuthenticatingScene
} from './MailboxWizardScene'
import {
  MailboxWizardGmailConfigureScene,
  MailboxWizardGoogleServicesScene,
  MailboxWizardInboxConfigureScene
} from './MailboxWizardScene/Google'
import {
  MailboxWizardMicrosoftServicesScene,
  MailboxWizardMicrosoftConfigureScene
} from './MailboxWizardScene/Microsoft'
import {
  MailboxWizardGenericConfigureScene
} from './MailboxWizardScene/Generic'
import {
  AppWizardIntroScene,
  AppWizardTrayScene,
  AppWizardMailtoScene,
  AppWizardCompleteScene
} from './AppWizardScene'
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
import {
  WmailImportCompleteScene,
  WmailImportStartScene
} from './WmailImportScene'

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
          <Route path='/mailbox_wizard/authenticating' component={MailboxWizardAuthenticatingScene} />
          <Route path='/mailbox_wizard/complete/:mailboxId' component={MailboxWizardCompleteScene} />
          <Route path='/mailbox_wizard/google/configuregmail/:mailboxId' component={MailboxWizardGmailConfigureScene} />
          <Route path='/mailbox_wizard/google/configureinbox/:mailboxId' component={MailboxWizardInboxConfigureScene} />
          <Route path='/mailbox_wizard/google/services/:mailboxId' component={MailboxWizardGoogleServicesScene} />
          <Route path='/mailbox_wizard/microsoft/configure/:mailboxId' component={MailboxWizardMicrosoftConfigureScene} />
          <Route path='/mailbox_wizard/microsoft/services/:mailboxId' component={MailboxWizardMicrosoftServicesScene} />
          <Route path='/mailbox_wizard/generic/configure/:mailboxId' component={MailboxWizardGenericConfigureScene} />

          <Route path='/app_wizard/tray' component={AppWizardTrayScene} />
          <Route path='/app_wizard/mailto' component={AppWizardMailtoScene} />
          <Route path='/app_wizard/complete' component={AppWizardCompleteScene} />
          <Route path='/app_wizard/' component={AppWizardIntroScene} />

          <Route path='/incoming/compose' component={ComposePickerScene} />

          <Route path='/updates/checking/:provider' component={CheckingUpdatesScene} />
          <Route path='/updates/none/:provider' component={UpdateNoneScene} />
          <Route path='/updates/error/:provider' component={UpdateErrorScene} />
          <Route path='/updates/install/:provider' component={UpdateAvailableScene} />
          <Route path='/updates/available/:provider' component={UpdateAvailableScene} />

          <Route path='/pro' component={ProScene} />

          <Route path='/account/message' component={AccountMessageScene} />
          <Route path='/account/auth/:mode?' component={AccountAuthScene} />
          <Route path='/account/authenticating' component={AccountAuthenticatingScene} />
          <Route path='/account/view' component={AccountStandaloneScene} />

          <Route path='/wmailimport/start' component={WmailImportStartScene} />
          <Route path='/wmailimport/complete' component={WmailImportCompleteScene} />

          <EULAScene />
        </div>
      </HashRouter>
    )
  }
}
