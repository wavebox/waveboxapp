const fallbackConfig = {
  windowOpen: [
    {
      isDefault: true,
      name: 'default',
      matches: [
        { url: '*', disposition: 'background-tab', mode: 'EXTERNAL' },
        { url: '*', disposition: 'new-window', mode: 'POPUP_CONTENT' },
        { url: 'about\\:blank', mode: 'POPUP_CONTENT' },
        { url: '*', disposition: 'save-to-disk', mode: 'DOWNLOAD' }
      ]
    }
  ],
  navigate: []
}

export default fallbackConfig
