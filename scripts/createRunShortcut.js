const { ROOT_DIR, ASSETS_DIR } = require('./constants')
const fs = require('fs-extra')
const path = require('path')
const windowsShortcuts = process.platform === 'win32' ? require('windows-shortcuts') : undefined
const argv = require('yargs')
  .usage('Usage: $0 -out=[path]')
  .demandOption(['out'])
  .argv

if (process.platform === 'win32') {
  const vbsPath = path.join(__dirname, 'runshortcut.vbs')
  const vbs = [
    'Set objShell = CreateObject("Wscript.shell")',
    `objShell.CurrentDirectory = "${ROOT_DIR}"`,
    'objShell.Run "npm run dev:run", 0'
  ].join('\n')
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
