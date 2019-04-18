import { TouchBar, nativeImage, session, app } from 'electron'
import { accountStore, accountActions } from 'stores/account'
import Color from 'color'
import Resolver from 'Runtime/Resolver'
import fetch from 'electron-fetch'
import Jimp from 'jimp'
const { TouchBarButton } = TouchBar

let _jimpMaskCache

const privWindow = Symbol('privWindow')
const privMailboxes = Symbol('privState')
const privRendered = Symbol('privRendered')
const privImageCache = Symbol('privImageCache')

class MailboxesWindowTouchBarProvider {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param window: the window to bind to
  */
  constructor (window) {
    this[privWindow] = window
    this[privMailboxes] = new Map()
    this[privRendered] = []
    this[privImageCache] = new Map()

    accountStore.listen(this.accountChanged)
    this.updateTouchbar(accountStore.getState())
  }

  destroy () {
    accountStore.unlisten(this.accountChanged)
    this[privWindow] = undefined
  }

  /* ****************************************************************************/
  // Data lifecycle
  /* ****************************************************************************/

  accountChanged = (accountState) => {
    this.updateTouchbar(accountState)
  }

  /**
  * Updates the touchbar, ideally in-situ but sometimes as a complete re-render
  * @param accountState: the account state to use
  */
  updateTouchbar (accountState) {
    const mailboxes = accountState.allMailboxes()
    const imageResolutions = []
    const fullRender = mailboxes.length !== this[privRendered].length ||
      mailboxes.map((m) => m.id).join(',') !== this[privRendered].map((c) => c.mailboxId).join(',')

    if (fullRender) {
      this[privRendered] = []
    }

    mailboxes.forEach((mailbox, index) => {
      if (!this[privRendered][index]) {
        this[privRendered][index] = {
          mailboxId: mailbox.id,
          config: {},
          button: new TouchBarButton({
            click: function () {
              accountActions.changeActiveMailbox(this)
            }.bind(mailbox.id)
          })
        }
      }

      const avatar = accountState.getMailboxAvatarConfig(mailbox.id)
      let backgroundColor
      try {
        backgroundColor = Color(avatar.color).hex().toString()
      } catch (ex) {
        backgroundColor = undefined
      }

      const prevConfig = this[privRendered][index].config
      const button = this[privRendered][index].button
      const nextConfig = {
        mailboxId: mailbox.id,
        label: avatar.avatarCharacterDisplay || accountState.resolvedMailboxBaseDisplayName(mailbox.id)[0],
        backgroundColor: backgroundColor,
        iconUrl: avatar.hasAvatar
          ? avatar.resolveAvatar((i) => Resolver.image(i))
          : undefined
      }

      if (prevConfig.label !== nextConfig.label) {
        button.label = nextConfig.label
      }
      if (prevConfig.backgroundColor !== nextConfig.backgroundColor) {
        button.backgroundColor = nextConfig.backgroundColor
      }
      if (prevConfig.iconUrl !== nextConfig.iconUrl) {
        imageResolutions.push([mailbox.id, nextConfig.iconUrl])
      }

      this[privRendered][index].config = nextConfig
    })

    // Set the touchbar if a full render is required
    if (fullRender) {
      this[privWindow].setTouchBar(new TouchBar(
        this[privRendered].map(({ button }) => button)
      ))
    }

    // Resolve images
    imageResolutions.forEach((args) => {
      this.resolveImage(...args)
    })
  }

  /* ****************************************************************************/
  // Icon resolution
  /* ****************************************************************************/

  /**
  * Resolves an image and places it in the touchbar
  * @param mailboxId: the id of the mailbox to resolve for
  * @param iconUrl: the url to the icon
  */
  resolveImage (mailboxId, iconUrl) {
    if (!iconUrl) {
      this[privImageCache].delete(mailboxId)
      return
    }

    const cache = this[privImageCache].get(mailboxId)
    if (cache && cache.url === iconUrl) {
      this.injectResolvedImage(mailboxId, iconUrl, cache.image)
    } else {
      if (iconUrl.startsWith('data:image/')) {
        Promise.resolve()
          .then(() => {
            const dataIndex = iconUrl.indexOf(',')
            const data = iconUrl.slice(dataIndex + 1)
            return this.circlizeImage(Buffer.from(data, 'base64'))
          })
          .then((res) => Promise.resolve(nativeImage.createFromBuffer(res)))
          .catch((e) => Promise.resolve(nativeImage.createFromDataURL(iconUrl)))
          .then((image) => {
            this[privImageCache].set(mailboxId, { url: iconUrl, image: image })
            this.injectResolvedImage(mailboxId, iconUrl, image)
          })
      } else if (iconUrl.startsWith('http:') || iconUrl.startsWith('https://')) {
        const ses = session.fromPartition('temp')
        Promise.resolve()
          .then(() => fetch(iconUrl, {
            headers: {
              'accept': '*/*',
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': app.getLocale(),
              'upgrade-insecure-requests': '1',
              'user-agent': ses.getUserAgent()
            },
            useElectronNet: true,
            session: ses
          }))
          .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
          .then((res) => res.buffer())
          .then((res) => {
            return this.circlizeImage(res).catch(() => Promise.resolve(res))
          })
          .then((res) => nativeImage.createFromBuffer(res))
          .catch(() => nativeImage.createEmpty())
          .then((image) => {
            this[privImageCache].set(mailboxId, { url: iconUrl, image: image })
            this.injectResolvedImage(mailboxId, iconUrl, image)
          })
      } else {
        this[privImageCache].delete(mailboxId)
      }
    }
  }

  /**
  * Circles the image
  * @param img: the input image
  * @return promise
  */
  circlizeImage (img) {
    return Promise.resolve()
      .then(() => {
        return Promise.all([
          Jimp.read(img),
          _jimpMaskCache
            ? Promise.resolve(_jimpMaskCache)
            : Jimp.read(Resolver.image('touchbar/account_mask_64.png'))
              .then((mask) => {
                _jimpMaskCache = mask
                return Promise.resolve(mask)
              })
        ])
      })
      .then(([jimg, mask]) => {
        const masked = jimg.resize(64, 64).mask(mask, 0, 0)
        return masked.getBufferAsync(Jimp.MIME_PNG)
      })
  }

  /**
  * Injects a resolved image into the cache
  * @param mailboxId: the id of the mailbox
  * @param iconUrl: the url of the image
  * @param img: the native image to inject
  */
  injectResolvedImage (mailboxId, iconUrl, img) {
    const find = !!this[privRendered].find(({ config, button }) => {
      if (mailboxId === config.mailboxId) {
        if (config.iconUrl === iconUrl) {
          if (!img.isEmpty()) {
            button.icon = img
            button.label = undefined
          }
        }
        return true
      }
      return false
    })

    if (!find) {
      this[privImageCache].delete(mailboxId)
    }
  }
}

export default MailboxesWindowTouchBarProvider
