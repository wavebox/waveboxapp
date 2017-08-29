class ClassTools {
  /**
  * Automatically binds the functions with member and re-assigns to the class
  * @param member: the member to bind and update
  * @param names: the function names to autobind
  */
  static autobindFunctions (member, names) {
    names.forEach((name) => {
      member[name] = member[name].bind(member)
    })
  }
}

module.exports = ClassTools
