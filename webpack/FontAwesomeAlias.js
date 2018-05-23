const fs = require('fs')
const path = require('path')

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
  'regular/faSpinnerThird': 'solid/faSpinner',
  'regular/faStar': true,
  'solid/faCheck': true,
  'solid/faCheckCircle': true,
  'solid/faExclamation': true,
  'solid/faListAlt': true,
  'solid/faTasks': true,
  'solid/faGem': true,
  'solid/faMagic': true,
  'regular/faArrowAltSquareDown': 'regular/faSquare',
  'regular/faArrowAltSquareUp': 'regular/faSquare',
  'regular/faBell': true,
  'regular/faBellSlash': true,
  'regular/faBolt': 'solid/faBolt',
  'regular/faBrowser': 'regular/faSquare',
  'regular/faEdit': true,
  'regular/faSignOut': 'solid/faSignOutAlt',
  'regular/faSquare': true,
  'regular/faTimes': 'solid/faTimes',
  'regular/faWindow': 'regular/faSquare',
  'regular/faWindowMinimize': true,
  'solid/faMinus': true,
  'solid/faTimes': true
}

module.exports = function (nodeModulesPath) {
  const proPaths = [
    path.join(nodeModulesPath, '@fortawesome/fontawesome-pro-light'),
    path.join(nodeModulesPath, '@fortawesome/fontawesome-pro-regular'),
    path.join(nodeModulesPath, '@fortawesome/fontawesome-pro-solid')
  ]
  const hasPro = !!proPaths.find((p) => fs.existsSync(p))

  if (hasPro) {
    return {}
  } else {
    return Object.keys(FREE_MAPPING).reduce((acc, k) => {
      const val = FREE_MAPPING[k]
      if (val === true) {
        acc[`@fortawesome/fontawesome-pro-${k}`] = path.join(nodeModulesPath, `@fortawesome/fontawesome-free-${k}`)
      } else {
        acc[`@fortawesome/fontawesome-pro-${k}`] = path.join(nodeModulesPath, `@fortawesome/fontawesome-free-${FREE_MAPPING[k]}`)
      }
      return acc
    }, {})
  }
}
