import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'
import { Table, TableHeader, TableRow, TableHeaderColumn, TableBody, TableRowColumn } from 'material-ui'

export default class ProcessMonitor extends React.Component {
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
      processInfo: monitorStore.getState().processInfoArray()
    }
  })()

  monitorUpdated = (monitorState) => {
    this.setState({
      processInfo: monitorState.processInfoArray()
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
  * @param proc: the process info
  * @return jsx
  */
  renderRow (proc) {
    return (
      <TableRow key={proc.pid}>
        <TableRowColumn style={{width: 100}}>
          {proc.pid}
        </TableRowColumn>
        <TableRowColumn>
          {proc.description || '-'}
        </TableRowColumn>
        <TableRowColumn style={{width: 100}}>
          {`${Math.round((proc.workingSetSize || 0) / 1024)} MB`}
        </TableRowColumn>
        <TableRowColumn style={{width: 100}}>
          {proc.percentCPUUsage === undefined ? '-' : (Math.round(proc.percentCPUUsage * 100) / 100) + '%'}
        </TableRowColumn>
      </TableRow>
    )
  }

  render () {
    const { processInfo } = this.state

    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={{width: 100}}>Pid</TableHeaderColumn>
            <TableHeaderColumn>Description</TableHeaderColumn>
            <TableHeaderColumn style={{width: 100}}>Memory</TableHeaderColumn>
            <TableHeaderColumn style={{width: 100}}>CPU</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} stripedRows>
          {processInfo.map((proc) => this.renderRow(proc))}
        </TableBody>
      </Table>
    )
  }
}
