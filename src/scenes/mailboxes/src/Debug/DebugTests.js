const mailboxPersistence = require('stores/mailbox/mailboxPersistence')

class DebugTests {
  /* **************************************************************************/
  // Database
  /* **************************************************************************/

  /**
  * Runs an analyze test on the mailbox databases
  * @param runs=20: the amount of measure tests to run
  */
  analyzeMailboxesDatabase (runs = 20) {
    const sig = '[TEST:MAILBOXES_DB]'
    console.log(`${sig} start`)
    Promise.resolve()
      .then(() => mailboxPersistence.getStats())
      .then((stats) => {
        console.log(`${sig} stats`, JSON.stringify(stats, null, 2))
        return Promise.resolve()
      })
      .then(() => console.log(`${sig} Wavebox may become unresponsive whilst the following test runs...`))
      .then(() => mailboxPersistence.measurePerformance(runs))
      .then((performance) => {
        const info = Object.keys(performance).reduce((acc, k) => {
          const avg = performance[k].reduce((a, b) => a + b, 0) / performance[k].length
          acc[k] = `First: ${performance[k][0]}ms. Avg: ${avg}ms`
          return acc
        }, {})
        console.log(`${sig} performance`, JSON.stringify(info, null, 2))
        return Promise.resolve()
      })
      .then(() => {
        console.log(`${sig} finish`)
      })
  }
}

module.exports = DebugTests
