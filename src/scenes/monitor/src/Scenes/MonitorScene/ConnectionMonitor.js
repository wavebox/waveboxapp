import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'
import { Table, TableHeader, TableRow, TableHeaderColumn, TableBody, TableRowColumn, FontIcon } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'

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
      connectionInfo: monitorStore.getState().connectionInfoArray()
    }
  })()

  monitorUpdated = (monitorState) => {
    this.setState({
      connectionInfo: monitorState.connectionInfoArray()
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
      <TableRow key={key}>
        <TableRowColumn style={{width: 100}}>
          {conn.pid}
        </TableRowColumn>
        <TableRowColumn>
          {conn.description || '-'}
        </TableRowColumn>
        <TableRowColumn style={{width: 100, textAlign: 'center'}}>
          <FontIcon className='material-icons' color={conn.isSetup ? Colors.green600 : Colors.red600}>
            {conn.isSetup ? 'check_circle' : 'cancel'}
          </FontIcon>
        </TableRowColumn>
        <TableRowColumn style={{width: 100, textAlign: 'center'}}>
          <FontIcon className='material-icons' color={conn.isConnected ? Colors.green600 : Colors.red600}>
            {conn.isConnected ? 'check_circle' : 'cancel'}
          </FontIcon>
        </TableRowColumn>
        <TableRowColumn style={{width: 100, textAlign: 'center'}}>
          <FontIcon className='material-icons' color={conn.isUnderMaintenance ? Colors.amber600 : Colors.green600}>
            {conn.isUnderMaintenance ? 'warning' : 'cancel'}
          </FontIcon>
        </TableRowColumn>
        <TableRowColumn style={{width: 150}}>
          {conn.connectionMode}
        </TableRowColumn>
      </TableRow>
    )
  }

  render () {
    const { connectionInfo } = this.state

    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={{width: 100}}>Pid</TableHeaderColumn>
            <TableHeaderColumn>Description</TableHeaderColumn>
            <TableHeaderColumn style={{width: 100, textAlign: 'center', padding: 0}}>Setup</TableHeaderColumn>
            <TableHeaderColumn style={{width: 100, textAlign: 'center', padding: 0}}>Connected</TableHeaderColumn>
            <TableHeaderColumn style={{width: 100, textAlign: 'center', padding: 0}}>Maintenance</TableHeaderColumn>
            <TableHeaderColumn style={{width: 150}}>Mode</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} stripedRows>
          {connectionInfo.map((conn, i) => this.renderRow(conn, i))}
        </TableBody>
      </Table>
    )
  }
}
