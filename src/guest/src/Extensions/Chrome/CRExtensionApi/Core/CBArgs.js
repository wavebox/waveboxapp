module.exports = function (args) {
  const cb = typeof (args[args.length - 1]) === 'function' ? args[args.length - 1] : undefined
  return {
    args: cb ? args.slice(0, -1) : args,
    callback: cb
  }
}
