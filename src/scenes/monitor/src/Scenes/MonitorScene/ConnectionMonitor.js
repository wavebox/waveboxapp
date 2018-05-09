import './MonitorTable.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'
import green from 'material-ui/colors/green'
import amber from 'material-ui/colors/amber'
import red from 'material-ui/colors/red'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import WarningIcon from '@material-ui/icons/Warning'

export default class ConnectionMonitor extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    monitorStore.listen(this.monitorUpdated)
  }

  componentWillUnmount () {
    monitorStore.unlisten(this.monitorUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      connections: monitorStore.getState().allConnectionMetrics()
    }
  })()

  monitorUpdated = (monitorState) => {
    this.setState({
      connections: monitorState.allConnectionMetrics()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders a row
  * @param conn: the connection info
  * @param index: the connection index
  * @return jsx
  */
  renderRow (conn, index) {
    const key = [
      conn.pid,
      index,
      conn.connection,
      conn.isSetup,
      conn.isConnected,
      conn.isUnderMaintenance,
      conn.connection
    ].join('_')
    return (
      <tr key={key}>
        <td className='fixed-100'>
          {conn.pid}
        </td>
        <td>
          {conn.description || '-'}
        </td>
        <td className='icon'>
          {conn.isSetup ? (
            <CheckCircleIcon style={{ color: green['600'] }} />
          ) : (
            <CancelIcon style={{ color: red['600'] }} />
          )}
        </td>
        <td className='icon'>
          {conn.isConnected ? (
            <CheckCircleIcon style={{ color: green['600'] }} />
          ) : (
            <CancelIcon style={{ color: red['600'] }} />
          )}
        </td>
        <td className='icon'>
          {conn.isUnderMaintenance ? (
            <WarningIcon style={{ color: amber['600'] }} />
          ) : (
            <CheckCircleIcon style={{ color: green['600'] }} />
          )}
        </td>
        <td className='fixed-150'>
          {conn.connectionMode}
        </td>
      </tr>
    )
  }

  render () {
    const { connections } = this.state

    return (
      <table className='RC-MonitorTable'>
        <thead>
          <tr>
            <th className='fixed-100'>Pid</th>
            <th>Description</th>
            <th className='icon'>Setup</th>
            <th className='icon'>Connected</th>
            <th className='icon'>Maintenance</th>
            <th className='fixed-150'>Mode</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((conn, i) => this.renderRow(conn, i))}
        </tbody>
      </table>
    )
  }
}
