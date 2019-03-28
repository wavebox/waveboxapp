import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RouterDialogRoute } from 'wbui/RouterDialog'
import settingsActions from 'stores/settings/settingsActions'
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
import WaveboxRouterErrorBoundary from 'wbui/WaveboxRouter/WaveboxRouterErrorBoundary'
import WaveboxRouterNoMatch from 'wbui/WaveboxRouter/WaveboxRouterNoMatch'
import {
  ProfileRestoreScene,
  ProfileRestoreFetchingScene,
  ProfileRestoreRestartingScene
} from './ProfileRestoreScene'
import { BookmarkEditScene } from './BookmarkScene'
import ErrorBoundary from 'wbui/ErrorBoundary'
import FullscreenSnackbarHelper from 'Components/FullscreenSnackbarHelper'
import KeyboardQuitSnackbarHelper from 'wbui/KeyboardQuitSnackbarHelper'
import SpinnerScene from './SpinnerScene'
import ReadingQueueSnackbarHelper from 'wbui/ReadingQueueSnackbarHelper'
import CommandPaletteScene from './CommandPaletteScene'
import SwitcherScene from './SwitcherScene'
import ULinkORScene from './ULinkORScene'

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
          <ErrorBoundary>
            <KeyboardQuitSnackbarHelper
              onRequestAlwaysQuitImmediately={() => settingsActions.sub.ui.setWarnBeforeKeyboardQuitting(false)} />
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

          {/* Dialogs: link open */}
          <WaveboxRouterErrorBoundary>
            <ULinkORScene routeName='ulinkor_ask' />
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

          {/* Dialogs: App Wizard */}
          <WaveboxRouterErrorBoundary>
            <AppWizardScene routeName='app_wizard' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Bookmarks */}
          <WaveboxRouterErrorBoundary>
            <BookmarkEditScene routeName='bookmark_edit' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Compose */}
          <WaveboxRouterErrorBoundary>
            <ComposePickerScene routeName='incoming_compose' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Updates */}
          <WaveboxRouterErrorBoundary>
            <CheckingUpdatesScene routeName='update_checking' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <UpdateNoneScene routeName='update_none' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <UpdateErrorScene routeName='update_error' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <UpdateAvailableScene routeName='update_available_install' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <UpdateAvailableScene routeName='update_available_download' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Pro & Subscription */}
          <WaveboxRouterErrorBoundary>
            <ProScene routeName='wbaccount_pro' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <NewsScene routeName='news' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <AccountMessageScene routeName='wbaccount_message' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <AccountAuthScene routeName='wbaccount_auth' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <AccountAuthenticatingScene routeName='wbaccount_authing' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <AccountStandaloneScene routeName='wbaccount_account' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Setup */}
          {process.platform === 'linux' ? (
            <WaveboxRouterErrorBoundary>
              <LinuxSetupScene routeName='setup_linux' />
            </WaveboxRouterErrorBoundary>
          ) : undefined}

          {/* Dialogs: Profile */}
          <WaveboxRouterErrorBoundary>
            <ProfileRestoreScene routeName='profile_restore' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <ProfileRestoreFetchingScene routeName='profile_fetch' />
          </WaveboxRouterErrorBoundary>
          <WaveboxRouterErrorBoundary>
            <ProfileRestoreRestartingScene routeName='profile_restart' />
          </WaveboxRouterErrorBoundary>

          {/* Dialogs: Utils */}
          <WaveboxRouterErrorBoundary>
            <SpinnerScene routeName='spinner' />
          </WaveboxRouterErrorBoundary>

          {/* Routes */}
          <WaveboxRouterErrorBoundary>
            <Switch>
              {/* Dialogs: Switching */}
              <RouterDialogRoute path='/command' routeName='command' />
              <RouterDialogRoute path='/switcher/:mode?' routeName='switcher' />

              {/* Dialogs: Settings */}
              <RouterDialogRoute path='/settings/:tab?/:tabArg?' routeName='settings' />
              <RouterDialogRoute path='/site_permissions' routeName='site_permissions' />
              <RouterDialogRoute path='/dictionary_installer' routeName='dictionary_installer' />

              {/* Dialogs: Links */}
              <RouterDialogRoute path='/link/open/:requestId' routeName='ulinkor_ask' />

              {/* Dialogs: Mailbox wizard */}
              <RouterDialogRoute path='/mailbox_wizard/add/:mailboxId?' routeName='account_wizard_add' />
              <RouterDialogRoute path='/mailbox_wizard/:templateType/:accessMode/:step/:mailboxId?' routeName='account_wizard_create' />
              <RouterDialogRoute path='/mailbox_attach_wizard/:attachTarget/:serviceType/:accessMode/:step/:serviceId?' routeName='account_wizard_attach' />
              <RouterDialogRoute path='/mailbox/reauthenticating' routeName='account_reathenticating' />

              {/* Dialogs: Account Deletion */}
              <RouterDialogRoute path='/mailbox_delete/:mailboxId' routeName='mailbox_delete' />
              <RouterDialogRoute path='/mailbox_service_delete/:mailboxId/:serviceId' routeName='service_delete' />

              {/* Dialogs: App Wizard */}
              <RouterDialogRoute path='/app_wizard/:step?' routeName='app_wizard' />

              {/* Dialogs: Bookmarks */}
              <RouterDialogRoute path='/bookmark/edit/:serviceId/:bookmarkId' routeName='bookmark_edit' />

              {/* Dialogs: Compose */}
              <RouterDialogRoute path='/incoming/compose' routeName='incoming_compose' />

              {/* Dialogs: Updates */}
              <RouterDialogRoute path='/updates/checking/:provider' routeName='update_checking' />
              <RouterDialogRoute path='/updates/none/:provider' routeName='update_none' />
              <RouterDialogRoute path='/updates/error/:provider' routeName='update_error' />
              <RouterDialogRoute path='/updates/install/:provider' routeName='update_available_install' />
              <RouterDialogRoute path='/updates/available/:provider' routeName='update_available_download' />

              {/* Dialogs: Pro & Subscription */}
              <RouterDialogRoute path='/pro' routeName='wbaccount_pro' />
              <RouterDialogRoute path='/news' routeName='news' />
              <RouterDialogRoute path='/account/message' routeName='wbaccount_message' />
              <RouterDialogRoute path='/account/auth/:mode?' routeName='wbaccount_auth' />
              <RouterDialogRoute path='/account/authenticating' routeName='wbaccount_authing' />
              <RouterDialogRoute path='/account/view' routeName='wbaccount_account' />

              {/* Dialogs: Setup */}
              {process.platform === 'linux' ? (
                <RouterDialogRoute path='/setup/linux' routeName='setup_linux' />
              ) : undefined}

              {/* Dialogs: Profile */}
              <RouterDialogRoute path='/profile/restore' routeName='profile_restore' />
              <RouterDialogRoute path='/profile/fetching_profiles' routeName='profile_fetch' />
              <RouterDialogRoute path='/profile/restore_restarting' routeName='profile_restart' />

              {/* Dialogs: Utils */}
              <RouterDialogRoute path='/spinner' routeName='spinner' />

              <Route path='/keyboardtarget' render={() => { return false }} />

              <Route component={WaveboxRouterNoMatch} />
            </Switch>
          </WaveboxRouterErrorBoundary>
          <PrivacyDialog />
        </div>
      </HashRouter>
    )
  }
}
