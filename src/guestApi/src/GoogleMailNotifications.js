
;(function () {
  if (window.localStorage['__wb_dt_notif_helper_seen'] === 'true') {
    return
  }

  const show = function () {
    const toast = document.createElement('div')
    toast.style.position = 'fixed'
    toast.style.bottom = '16px'
    toast.style.left = '16px'
    toast.style.height = '48px'
    toast.style.lineHeight = '48px'
    toast.style.backgroundColor = 'rgb(49, 49, 49)'
    toast.style.color = '#FFFFFF'
    toast.style.borderRadius = '4px'
    toast.style.paddingLeft = '24px'
    toast.style.paddingRight = '24px'
    toast.style.fontWeight = '400'
    toast.style.cursor = 'pointer'
    toast.style.fontSize = '0.875rem'
    toast.style.boxShadow = '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)'
    toast.style.zIndex = '10000'
    toast.textContent = 'Enable Desktop Notifications in Gmail Settings'

    const settings = document.createElement('a')
    settings.style.color = '#2196f3'
    settings.style.fontSize = '0.75rem'
    settings.style.marginLeft = '24px'
    settings.style.textDecoration = 'none'
    settings.href = '#settings/general'
    settings.textContent = 'SETTINGS'
    toast.appendChild(settings)

    const help = document.createElement('a')
    help.style.color = '#2196f3'
    help.style.fontSize = '0.75rem'
    help.style.marginLeft = '24px'
    help.style.textDecoration = 'none'
    help.target = '_blank'
    help.href = 'https://wavebox.io/redir/gmail-html5-notifications'
    help.textContent = 'HELP'
    toast.appendChild(help)

    toast.addEventListener('click', function () {
      window.localStorage['__wb_dt_notif_helper_seen'] = 'true'
      toast.parentElement.removeChild(toast)
    })
    document.body.appendChild(toast)
  }

  if (document.readyState === 'complete') {
    setTimeout(() => {
      show()
    }, 5000)
  } else {
    document.addEventListener('DOMContentLoaded', (event) => {
      setTimeout(() => {
        show()
      }, 5000)
    })
  }
})()
