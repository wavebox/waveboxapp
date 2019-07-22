(function () {
  if (window.location.hostname === 'docs.google.com') {
    window._docs_chrome_extension_exists = true
    window._docs_chrome_extension_permissions = [
      'clipboardRead',
      'clipboardWrite'
    ]
  }

  // Drop support: https://github.com/electron/electron/issues/7150
  delete window.PasswordCredential

  if (!window.chrome) {
    const oPerformance = window.performance
    window.chrome = {
      app: {
        InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
        RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
        getDetails: () => null,
        getIsInstalled: () => false,
        installState: (cb) => cb('not_installed'),
        isInstalled: false,
        runningState: () => 'cannot_run'
      },
      runtime: {
        OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
        OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
        PlatformArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
        RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' },
        id: undefined,
        connect: (extensionId, args) => {
          return {
            name: (args || {}).name,
            sender: undefined,
            postMessage: function () { },
            disconnect: function () { },
            ...['onDisconnect', 'onMessage'].reduce((acc, k) => {
              acc[k] = {
                addListener: function () { },
                dispatch: function () { },
                hasListener: function () { },
                hasListeners: function () { },
                removeListener: function () { },
                removeAllListenrs: function () { }
              }
              return acc
            }, {})
          }
        },
        sendMessage: () => {}
      },
      csi: () => {
        const timing = oPerformance.timing
        return {
          startE: timing.navigationStart,
          onloadT: timing.domContentLoadedEventEnd,
          pageT: oPerformance.now(),
          tran: 15
        }
      },
      loadTimes: () => {
        const timing = oPerformance.timing
        return {
          commitLoadTime: timing.responseStart / 100,
          connectionInfo: 'h2',
          finishDocumentLoadTime: timing.domContentLoadedEventEnd / 100,
          finishLoadTime: timing.loadEventEnd / 100,
          firstPaintAfterLoadTime: 0,
          firstPaintTime: timing.domInteractive / 100, // estimate
          navigationType: 'Other',
          npnNegotiatedProtocol: 'h2',
          requestTime: timing.navigationStart,
          startLoadTime: timing.navigationStart,
          wasAlternateProtocolAvailable: false,
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true
        }
      }
    }
  }
})()
