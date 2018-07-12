const fs = require('fs')
const path = require('path')

// FontAwesome used to export the icons with the default module export which meant we didn't
// need named members to import. They changed this which meant that to import you had to do
// "import { named } from 'a/b/c'". This means we can't blindly overwrite any import which
// is a real pain. To ensure the app compiles, send 'regular/faSquare' back, which will fail
// silently at runtime. The app then uses a wrapper around FontAwesomeIcon which checks for
// and undefined icon and instead maps it out to faSquare at runtime. This is a real pain.
const FREE_UNMAPPABLE = 'regular/faSquare'

const FREE_MAPPING = {
  'regular/faCheck': 'solid/faCheck',
  'light/faWindowClose': 'regular/faWindowClose',
  'light/faWindowMaximize': 'regular/faWindowMaximize',
  'light/faWindowMinimize': 'regular/faWindowMinimize',
  'light/faWindowRestore': 'regular/faWindowRestore',
  'regular/faCalendar': true,
  'regular/faGem': true,
  'regular/faInfoCircle': 'solid/faInfoCircle',
  'regular/faMagic': 'solid/faMagic',
  'regular/faQuestionCircle': true,
  'regular/faSpinnerThird': false,
  'regular/faStar': true,
  'solid/faCheck': true,
  'solid/faCheckCircle': true,
  'solid/faExclamation': true,
  'solid/faListAlt': true,
  'solid/faTasks': true,
  'solid/faGem': true,
  'solid/faMagic': true,
  'regular/faArrowAltSquareDown': false,
  'regular/faArrowAltSquareUp': false,
  'regular/faBell': true,
  'regular/faBellSlash': true,
  'regular/faBolt': 'solid/faBolt',
  'regular/faBrowser': false,
  'regular/faEdit': true,
  'regular/faSignOut': false,
  'regular/faSquare': true,
  'regular/faTimes': 'solid/faTimes',
  'regular/faWindow': false,
  'regular/faWindowMinimize': true,
  'solid/faMinus': true,
  'solid/faTimes': true,
  'solid/faUpload': true,
  'solid/faDownload': true,
  'solid/faCloudDownload': false,
  'solid/faCloudUpload': false,
  'solid/faSync': true
}

module.exports = function (nodeModulesPath) {
  const proPaths = [
    path.join(nodeModulesPath, '@fortawesome/pro-light-svg-icons'),
    path.join(nodeModulesPath, '@fortawesome/pro-regular-svg-icons'),
    path.join(nodeModulesPath, '@fortawesome/pro-solid-svg-icons')
  ]
  const hasPro = !!proPaths.find((p) => fs.existsSync(p))

  if (hasPro) {
    return {}
  } else {
    return Object.keys(FREE_MAPPING).reduce((acc, k) => {
      const val = FREE_MAPPING[k]
      const [prevWeight, prevName] = k.split('/')
      const nextComposite = val === true ? k : val === false ? FREE_UNMAPPABLE : val
      const [nextWeight, nextName] = nextComposite.split('/')
      const prev = `@fortawesome/pro-${prevWeight}-svg-icons/${prevName}`
      const next = `@fortawesome/free-${nextWeight}-svg-icons/${nextName}`
      acc[prev] = path.join(nodeModulesPath, next)
      return acc
    }, {})
  }
}
