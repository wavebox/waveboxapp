const { execSync } = require('child_process')
const TableParser = require('table-parser')
const net = require('net')
const pkg = require('../package.json')
const os = require('os')
const path = require('path')
const yargs = require('yargs')

const LOG_PFX = '[WB_LAS]'
const ARG_DISABLE_KEY = 'WBLASDisable'

class LinuxAppSingleton {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param activateFn: function that will be called when another process activates this
  * @param quitFn: function that will be called when this process should be quit
  */
  constructor () {
    this._setup_ = false
    this._server_ = null
    this._activateFn_ = null
    this._quitFn_ = null
    const argv = yargs
      .boolean(ARG_DISABLE_KEY)
      .parse(process.argv)
    this._disabled_ = argv[ARG_DISABLE_KEY]
  }

  /**
  * Tears down anything that it can
  */
  teardown () {
    this._activateFn_ = null
    this._quitFn_ = null
    this._setup_ = false
    if (this._server_) {
      try { this._server_.close() } catch (ex) { }
    }
  }

  /* ****************************************************************************/
  // Single instance
  /* ****************************************************************************/

  /**
  * Sets up the callbacks
  * @param activateFn: the function to call to activate this instance
  * @Param quitFn: the function to call to quit this instance
  */
  makeSingleInstance (activateFn, quitFn) {
    if (this._disabled_) {
      console.log(`${LOG_PFX} disabled. Starting app in multi-instance mode`)
      return false
    }

    if (this._setup_) { throw new Error('Can only setup one') }
    this._setup_ = true
    this._activateFn_ = activateFn
    this._quitFn_ = quitFn

    console.log(`${LOG_PFX} started ${process.pid}`)
    let otherProcesses
    try {
      otherProcesses = this._getOtherInstanceProcessesSync()
    } catch (ex) {
      console.error(`${LOG_PFX} failed to get process list. Starting app in multi-instance mode. More error information to follow...`)
      console.error(ex)
      this._setupListeningServer()
      return false
    }

    if (otherProcesses.length === 0) {
      console.log(`${LOG_PFX} no other processes found. Allowing run...`)
      this._setupListeningServer()
      return false
    }
    console.log(`${LOG_PFX} ${otherProcesses.length} processes found. Messaging...`)

    Promise.all(
      otherProcesses.map((proc) => {
        this._messageRunningProcess(proc.PID[0]).catch(() => Promise.resolve())
      })
    ).then(
      () => this._quitFn_(),
      () => this._quitFn_()
    )

    return true
  }

  /* ****************************************************************************/
  // Process inspection
  /* ****************************************************************************/

  /**
  * @return a list of processes running in another instance
  */
  _getOtherInstanceProcessesSync () {
    const processListString = execSync('ps x -o pid,ppid,ucomm').toString()
    const processList = TableParser.parse(processListString)
    const currentProcess = processList.find((proc) => proc.PID === `${process.pid}` || proc.PID[0] === `${process.pid}`)
    if (!currentProcess) { throw new Error('Unable to locate current process') }

    const otherProcesses = processList.filter((proc) => {
      if (proc.PID[0] === currentProcess.PID[0]) { return false }
      if (proc.PPID[0] === currentProcess.PID[0]) { return false }
      return (proc.COMMAND || proc.UCOMM).join(' ') === (currentProcess.COMMAND || currentProcess.UCOMM).join(' ')
    })

    return otherProcesses
  }

  /* ****************************************************************************/
  // Listener setup
  /* ****************************************************************************/

  /**
  * @param pid: the process to generate the socket for
  * @return the path to the socket for that process
  */
  _generateSocketPath (pid) {
    return path.join(os.tmpdir(), `${pkg.name}_${pid}.sock`)
  }

  _setupListeningServer () {
    this._server_ = net.createServer((conn) => {
      conn.setEncoding('utf8')
      conn.on('data', (data) => {
        try {
          data = JSON.parse(data)
        } catch (ex) {
          return
        }
        if (data.action === 'activate') {
          console.log(`${LOG_PFX} Received activate from ${data.pid}`)
          this._activateFn_()
        }
        conn.destroy()
      })
    }).listen(this._generateSocketPath(process.pid))
  }

  /**
  * Messages a running process
  * @param pid: the process id
  * @return promise
  */
  _messageRunningProcess (pid) {
    return new Promise((resolve, reject) => {
      let resolved = false
      const client = net.createConnection(this._generateSocketPath(pid), () => {
        console.log(`${LOG_PFX} Activating ${pid}`)
        client.write(JSON.stringify({ action: 'activate', pid: process.pid }))
      })
      client.on('end', () => {
        client.destroy()
        if (!resolved) {
          resolved = true
          resolve()
        }
      })
      client.on('close', () => {
        client.destroy()
        if (!resolved) {
          resolved = true
          resolve()
        }
      })
      client.on('error', () => {
        client.destroy()
        if (!resolved) {
          resolved = true
          reject(new Error('Socket Error'))
        }
      })
      client.on('timeout', () => {
        client.destroy()
        if (!resolved) {
          resolved = true
          reject(new Error('Socket Timeout'))
        }
      })
    })
  }
}

module.exports = new LinuxAppSingleton()
