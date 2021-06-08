const throwErr = function (identifier) {
  throw new Error(`SubclassNotImplementedError: Subclass should implement "${identifier}" but does not`)
}

export default throwErr
