import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RouterDialogController } from 'Components/RouterDialog'
import AppScene from './AppScene'
import EarlyBuildToast from './EarlyBuildToast'
import PrivacyDialog from './PrivacyDialog'
import ProScene from './ProScene'
import NewsScene from './NewsScene'
import MailboxReauthenticatingScene from './MailboxReauthenticatingScene'
import {
  CheckingUpdatesScene,
  UpdateAvailableScene,
  UpdateErrorScene,
  UpdateNoneScene
} from './UpdatesScene'
import LinuxSetupScene from './LinuxSetupScene'
import DictionaryInstallerScene from './DictionaryInstallerScene'
import AppWizardScene from './AppWizardScene'
import {
  MailboxWizardScene,
  ServiceAttachWizardScene,
  AccountWizardAddScene
} from './AccountWizardScene'
import SettingsScene from './SettingsScene'
import SitePermissionsScene from './SitePermissionsScene'
import MailboxServiceDeleteScene from './MailboxServiceDeleteScene'
import MailboxDeleteScene from './MailboxDeleteScene'
import ComposePickerScene from './ComposePickerScene'
import {
  AccountMessageScene,
  AccountAuthScene,
  AccountAuthenticatingScene,
  AccountStandaloneScene
} from './AccountScene'
import WaveboxRouterErrorBoundary from './WaveboxRouterErrorBoundary'
import WaveboxRouterNoMatch from './WaveboxRouterNoMatch'
import {
  ProfileRestoreScene,
  ProfileRestoreFetchingScene,
  ProfileRestoreRestartingScene
} from './ProfileRestoreScene'
import ErrorBoundary from 'wbui/ErrorBoundary'
import FullscreenSnackbarHelper from 'Components/FullscreenSnackbarHelper'
import SpinnerScene from './SpinnerScene'
import ReadingQueueSnackbarHelper from 'wbui/ReadingQueueSnackbarHelper'
import CommandPaletteScene from './CommandPaletteScene'
import SwitcherScene from './SwitcherScene'

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

          <ErrorBoundary>
            <EarlyBuildToast />
          </ErrorBoundary>
          <ErrorBoundary>
            <FullscreenSnackbarHelper />
          </ErrorBoundary>
          <ErrorBoundary>
            <ReadingQueueSnackbarHelper />
          </ErrorBoundary>

          {/* Dialogs: Switching */}
          <WaveboxRouterErrorBoundary>
            <CommandPaletteScene routeName='command' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <SwitcherScene routeName='switcher' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Settings */}
          <WaveboxRouterErrorBoundary>
            <SettingsScene routeName='settings' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <SitePermissionsScene routeName='site_permissions' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <DictionaryInstallerScene routeName='dictionary_installer' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Mailbox wizard */}
          <WaveboxRouterErrorBoundary>
            <AccountWizardAddScene routeName='account_wizard_add' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <MailboxWizardScene routeName='account_wizard_create' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <ServiceAttachWizardScene routeName='account_wizard_attach' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <MailboxReauthenticatingScene routeName='account_reathenticating' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Account Deletion */}
          <WaveboxRouterErrorBoundary>
            <MailboxDeleteScene routeName='mailbox_delete' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <MailboxServiceDeleteScene routeName='service_delete' />
          </WaveboxRouterErrorBoundary>

          {/* Routes */}
          <WaveboxRouterErrorBoundary>
            <Switch>
              {/* Dialogs: Switching */}
              <Route
                path='/command'
                render={(p) => (<RouterDialogController {...p} routeName='command' />)} />
              <Route
                path='/switcher/:mode?'
                render={(p) => (<RouterDialogController {...p} routeName='switcher' />)} />

              {/* Dialogs: Settings */}
              <Route
                path='/settings/:tab?/:tabArg?'
                render={(p) => (<RouterDialogController {...p} routeName='settings' />)} />
              <Route
                path='/site_permissions'
                render={(p) => (<RouterDialogController {...p} routeName='site_permissions' />)} />
              <Route
                path='/dictionary_installer'
                render={(p) => (<RouterDialogController {...p} routeName='dictionary_installer' />)} />

              {/* Dialogs: Mailbox wizard */}
              <Route
                path='/mailbox_wizard/add/:mailboxId?'
                render={(p) => (<RouterDialogController {...p} routeName='account_wizard_add' />)} />
              <Route
                path='/mailbox_wizard/:templateType/:accessMode/:step/:mailboxId?'
                render={(p) => (<RouterDialogController {...p} routeName='account_wizard_create' />)} />
              <Route
                path='/mailbox_attach_wizard/:attachTarget/:serviceType/:accessMode/:step/:serviceId?'
                render={(p) => (<RouterDialogController {...p} routeName='account_wizard_attach' />)} />
              <Route
                path='/mailbox/reauthenticating'
                render={(p) => (<RouterDialogController {...p} routeName='account_reathenticating' />)} />

              {/* Dialogs: Account Deletion */}
              <Route
                path='/mailbox_delete/:mailboxId'
                render={(p) => (<RouterDialogController {...p} routeName='mailbox_delete' />)} />
              <Route
                path='/mailbox_service_delete/:mailboxId/:serviceId'
                render={(p) => (<RouterDialogController {...p} routeName='service_delete' />)} />







              <Route path='/app_wizard/:step?' component={AppWizardScene} />

              <Route path='/incoming/compose' component={ComposePickerScene} />

              <Route path='/updates/checking/:provider' component={CheckingUpdatesScene} />
              <Route path='/updates/none/:provider' component={UpdateNoneScene} />
              <Route path='/updates/error/:provider' component={UpdateErrorScene} />
              <Route path='/updates/install/:provider' component={UpdateAvailableScene} />
              <Route path='/updates/available/:provider' component={UpdateAvailableScene} />

              <Route path='/pro' component={ProScene} />
              <Route path='/news' component={NewsScene} />
              <Route path='/spinner' component={SpinnerScene} />

              <Route path='/account/message' component={AccountMessageScene} />
              <Route path='/account/auth/:mode?' component={AccountAuthScene} />
              <Route path='/account/authenticating' component={AccountAuthenticatingScene} />
              <Route path='/account/view' component={AccountStandaloneScene} />

              <Route path='/setup/linux' component={LinuxSetupScene} />

              <Route path='/profile/restore' component={ProfileRestoreScene} />
              <Route path='/profile/fetching_profiles' component={ProfileRestoreFetchingScene} />
              <Route path='/profile/restore_restarting' component={ProfileRestoreRestartingScene} />

              <Route component={WaveboxRouterNoMatch} />
            </Switch>
          </WaveboxRouterErrorBoundary>
          <PrivacyDialog />
        </div>
      </HashRouter>
    )
  }
}
