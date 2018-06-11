class BuildDonePlugin {
  constructor (fn) {
    this.fn = fn
  }

  apply (compiler) {
    compiler.hooks.done.tap('BuildDonePlugin', (stats) => {
      this.fn(stats)
    })
  }
}

module.exports = BuildDonePlugin
