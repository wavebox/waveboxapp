const { LOCAL_SCRIPTS_DIR, ASSETS_DIR, ROOT_DIR } = require('./constants')
const fs = require('fs-extra')
const path = require('path')
const windowsShortcuts = process.platform === 'win32' ? require('windows-shortcuts') : undefined
const argv = require('yargs')
  .usage('Usage: $0 -out=[path]')
  .demandOption(['out'])
  .argv

if (process.platform === 'win32') {
  const vbsPath = path.join(LOCAL_SCRIPTS_DIR, 'runshortcut.vbs')
  const vbs = [
    'Set objShell = CreateObject("Wscript.shell")',
    `objShell.CurrentDirectory = "${ROOT_DIR}"`,
    'objShell.Run "npm run dev:run", 0'
  ].join('\n')
  fs.ensureDirSync(LOCAL_SCRIPTS_DIR)
  fs.writeFileSync(vbsPath, vbs)
  windowsShortcuts.create(
    fs.lstatSync(argv.out).isDirectory()
      ? path.join(argv.out, 'Wavebox.lnk')
      : argv.out,
    {
      target: vbsPath,
      icon: path.join(ASSETS_DIR, 'icons/app.ico')
    },
    (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('Done')
      }
    }
  )
} else {
  console.log('Unsupported platform')
}
