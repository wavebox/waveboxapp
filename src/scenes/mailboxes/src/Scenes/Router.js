const React = require('react')
const { Router, Route, Redirect, hashHistory, IndexRoute } = require('react-router')
const AppScene = require('./AppScene')
const SettingsScene = require('./SettingsScene')
const DictionaryInstallerScene = require('./DictionaryInstallerScene')
const ComposePickerScene = require('./ComposePickerScene')
const ProScene = require('./ProScene')
const EULAScene = require('./EULAScene')
const {
  MailboxWizardAddScene,
  MailboxWizardCompleteScene,
  MailboxWizardAuthenticatingScene,
  Google: {
    MailboxWizardGmailConfigureScene,
    MailboxWizardGoogleServicesScene,
    MailboxWizardInboxConfigureScene
  },
  Microsoft: {
    MailboxWizardMicrosoftServicesScene
  },
  Generic: {
    MailboxWizardGenericConfigureScene
  }
} = require('./MailboxWizardScene')
const {
  AppWizardIntroScene,
  AppWizardTrayScene,
  AppWizardMailtoScene,
  AppWizardCompleteScene
} = require('./AppWizardScene')
const {
  ManualUpdateAvailableScene,
  SquirrelUpdateDownloadedScene
} = require('./UpdatesScene')
const {
  AccountMessageScene,
  AccountAuthScene,
  AccountAuthenticatingScene,
  AccountStandaloneScene
} = require('./AccountScene')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'Router',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate () { return false },

  render () {
    return (
      <div>
        <Router history={hashHistory}>
          <Route path='/' component={AppScene}>
            <Route path='settings'>
              <IndexRoute component={SettingsScene} />
              <Route path=':tab/:tabArg' component={SettingsScene} />
              <Route path=':tab' component={SettingsScene} />
            </Route>
            <Route path='dictionary_installer' component={DictionaryInstallerScene} />
            <Route path='mailbox_wizard'>
              <Route path='add' component={MailboxWizardAddScene} />
              <Route path='authenticating' component={MailboxWizardAuthenticatingScene} />
              <Route path='complete' component={MailboxWizardCompleteScene} />
              <Route path='google/configuregmail/:mailboxId' component={MailboxWizardGmailConfigureScene} />
              <Route path='google/configureinbox/:mailboxId' component={MailboxWizardInboxConfigureScene} />
              <Route path='google/services/:mailboxId' component={MailboxWizardGoogleServicesScene} />
              <Route path='microsoft/services/:mailboxId' component={MailboxWizardMicrosoftServicesScene} />
              <Route path='generic/configure/:mailboxId' component={MailboxWizardGenericConfigureScene} />
            </Route>
            <Route path='app_wizard'>
              <IndexRoute component={AppWizardIntroScene} />
              <Route path='tray' component={AppWizardTrayScene} />
              <Route path='mailto' component={AppWizardMailtoScene} />
              <Route path='complete' component={AppWizardCompleteScene} />
            </Route>
            <Route path='incoming/compose' component={ComposePickerScene} />
            <Route path='updates'>
              <Route path='squirrel/install' component={SquirrelUpdateDownloadedScene} />
              <Route path='manual/available' component={ManualUpdateAvailableScene} />
            </Route>
            <Route path='pro' component={ProScene} />
            <Route path='account'>
              <Route path='message' component={AccountMessageScene} />
              <Route path='auth(/:mode)' component={AccountAuthScene} />
              <Route path='authenticating' component={AccountAuthenticatingScene} />
              <Route path='view(?url=:url)' component={AccountStandaloneScene} />
            </Route>
          </Route>
          <Redirect from='*' to='/' />
        </Router>
        <EULAScene />
      </div>
    )
  }
})
