const path = require('path')
const fs = require('fs-extra')
const { SRC_DIR } = require('./constants')
const OUT_DIR = path.join(SRC_DIR, 'scenes/wbfa/generated')
const Colors = require('colors/safe')

const VARIANTS = {
  'l': 'light',
  'r': 'regular',
  's': 'solid',
  'b': 'brands'
}

const MAPPING = [
  ['farCheck', 'fasCheck'],
  ['farCalendar', 'farCalendar'],
  ['farGem', 'farGem'],
  ['farInfoCircle', 'fasInfoCircle'],
  ['farMagic', 'fasMagic'],
  ['farQuestionCircle', 'farQuestionCircle'],
  ['farSpinnerThird', 'fasSpinner'],
  ['farStar', 'farStar'],
  ['farArrowAltSquareDown', 'farCaretSquareDown'],
  ['farArrowAltSquareUp', 'farCaretSquareUp'],
  ['farBell', 'farBell'],
  ['farBellSlash', 'farBellSlash'],
  ['farBolt', 'fasBolt'],
  ['farBrowser', 'farSquare'],
  ['farEdit', 'farEdit'],
  ['farSignOut', 'fasSignOutAlt'],
  ['farSquare', 'farSquare'],
  ['farTimes', 'fasTimes'],
  ['farWindow', 'farWindowMaximize'],
  ['farWindowMinimize', 'farWindowMinimize'],

  ['falWindowClose', 'farWindowClose'],
  ['falWindowMaximize', 'farWindowMaximize'],
  ['falWindowMinimize', 'farWindowMinimize'],
  ['falWindowRestore', 'farWindowRestore'],

  ['fasCheck', 'fasCheck'],
  ['fasCheckCircle', 'fasCheckCircle'],
  ['fasExclamation', 'fasExclamation'],
  ['fasListAlt', 'fasListAlt'],
  ['fasTasks', 'fasTasks'],
  ['fasGem', 'fasGem'],
  ['fasMagic', 'fasMagic'],
  ['fasMinus', 'fasMinus'],
  ['fasTimes', 'fasTimes'],
  ['fasUpload', 'fasUpload'],
  ['fasDownload', 'fasDownload'],
  ['fasCloudDownload', 'fasCloudDownloadAlt'],
  ['fasCloudUpload', 'fasCloudUploadAlt'],
  ['fasSync', 'fasSync'],
  ['fasWindowRestore', 'farWindowRestore'],
  ['fasWindowMaximize', 'farWindowMaximize'],
  ['fasWindowMinimize', 'farWindowMinimize'],
  ['fasWindowClose', 'farWindowClose'],
  ['fasEllipsisV', 'fasEllipsisV'],
  ['fasEllipsisH', 'fasEllipsisH'],
  ['fasCircle', 'fasCircle'],
  ['fasUserCircle', 'fasUserCircle'],
  ['fasFileDownload', 'fasFileDownload'],

  ['fabSlack', 'fabSlack'],
  ['fabGoogle', 'fabGoogle'],
  ['fabMicrosoft', 'fabMicrosoft'],
  ['fabTrello', 'fabTrello']
]

/**
* Gets the JS import path
* @param name: the name of the icon
* @param isPro: true if this is the pro variant
* @return the path
*/
const getImportPath = function (name, isPro) {
  const variant = VARIANTS[name[2]]
  const lib = isPro && name[2] !== 'b' ? 'pro' : 'free'
  const filename = `fa${name.substr(3)}`
  return `@fortawesome/${lib}-${variant}-svg-icons/${filename}`
}

/**
* Get the output filepath
* @param name: the name of the icon
* @param isPro: true if this is pro
* @return the path
*/
const getOutputFilepath = function (name, isPro) {
  const className = `FA${name[2].toUpperCase()}${name.substr(3)}`
  return path.join(OUT_DIR, `${className}.${isPro ? 'pro' : 'free'}.js`)
}

/**
* Get the output file content
* @param name: the name of the icon
* @param iconName: the name of actual icon to use
* @param isPro: true if this is pro
* @return the contents for the file
*/
const buildOutputFile = function (name, iconName, isPro) {
  const className = `FA${name[2].toUpperCase()}${name.substr(3)}`
  const variableName = `fa${iconName.substr(3)}`
  return [
    `import React from 'react'`,
    `import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'`,
    `import { ${variableName} } from '${getImportPath(iconName, isPro)}'`,
    `export default class ${className} extends React.Component {`,
    `  render () {`,
    `    return (<FontAwesomeIcon {...this.props} icon={${variableName}} />)`,
    `  }`,
    `}`,
    ``
  ].join('\n')
}

console.log(Colors.inverse(`Generating ${MAPPING.length} icons...`))

fs.removeSync(OUT_DIR)
fs.mkdir(OUT_DIR)

MAPPING.forEach(([pro, free]) => {
  fs.writeFileSync(getOutputFilepath(pro, true), buildOutputFile(pro, pro, true))
  fs.writeFileSync(getOutputFilepath(pro, false), buildOutputFile(pro, free, false))
  console.log(`  Created ${pro}:${free}`)
})

console.log(Colors.inverse(`...done`))
