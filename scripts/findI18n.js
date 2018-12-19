const glob = require('fast-glob')
const path = require('path')
const fs = require('fs-extra')
const Colors = require('colors/safe')
const {
  SUBPACKAGE_DIRS
} = require('./constants')
const USAGE_MATCH_RE = /[^a-zA-Z0-9](T|t)\(('|`)/
const QUOTE_MATCH_RE = /(["'`])(?:(?=(\\?))\2.)*?\1/
const argv = require('yargs')
  .boolean(['printfiles', 'printstrings', 'printfull'])
  .command('findmissing', 'Find missing items in the dictionary')
  .argv

/**
* Finds T() usages in code
* @param code: the code to look for
* @return an array of entries
*/
const findUsages = function (code) {
  return code
    .split('\n')
    .map((line, index) => {
      if (USAGE_MATCH_RE.exec(line) !== null) {
        return { index: index, line: line }
      } else {
        return undefined
      }
    })
    .filter((ent) => !!ent)
    .map((ent) => {
      let code = ent.line
      const strings = []
      while (true) {
        const match = QUOTE_MATCH_RE.exec(code)
        if (match === null) { break }
        strings.push(match[0].substr(1, match[0].length - 2))
        code = code.substr(match.index + match[0].length)
      }

      return {
        index: ent.index,
        line: ent.line,
        strings: strings
      }
    })
}

const usages = {}
Promise.resolve()
  .then(() => glob(SUBPACKAGE_DIRS.map((dir) => path.join(dir, 'src/**/*.js'))))
  .then((entries) => {
    return entries.reduce((acc, entry) => {
      return acc
        .then(() => fs.readFile(entry, 'utf8'))
        .then((code) => {
          const fileUsages = findUsages(code)
          if (fileUsages.length) {
            usages[entry] = fileUsages
          }
        })
    }, Promise.resolve())
  })
  .then(() => {
    if (argv.printfull) {
      const out = Object.keys(usages).map((file) => {
        const contents = usages[file].map((ent) => {
          return [
            `[${Colors.cyan(ent.index)}] ${Colors.yellow(ent.line)}`,
            `  ${ent.strings.join(', ')}`
          ].join('\n')
        }).join('\n')
        return `${Colors.inverse(file)}\n${contents}`
      }).join('\n')
      console.log(out)
    } else if (argv.printfiles) {
      const out = Object.keys(usages).map((file) => {
        const indecies = usages[file].map((ent) => ent.index)
        return `${Colors.inverse(file)} ${indecies.join(', ')}`
      }).join('\n')
      console.log(out)
    } else if (argv.printstrings) {
      const strings = new Set(
        Object.keys(usages).reduce((acc, file) => {
          return acc.concat(
            usages[file]
              .map((ent) => ent.strings)
              .reduce((acc, strs) => acc.concat(strs))
          )
        }, [])
      )
      console.log(Array.from(strings).join('\n'))
    } else if (argv.findmissing) {
      const input = fs.readJsonSync(argv.findmissing)
      const strings = new Set(
        Object.keys(usages).reduce((acc, file) => {
          return acc.concat(
            usages[file]
              .map((ent) => ent.strings)
              .reduce((acc, strs) => acc.concat(strs))
          )
        }, [])
      )

      Object.keys(input).forEach((str) => {
        strings.delete(str)
      })

      if (strings.size === 0) {
        console.log(Colors.green('No missing strings'))
      } else {
        const out = Array.from(strings).join('\n')
        console.log(Colors.red(`${strings.size} missing strings`))
        console.log(out)
      }
    } else {
      console.log(Colors.red('Nothing to do. Pass one of --printfull --printfiles --printstrings --findmissing=""'))
    }
  })
