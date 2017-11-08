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
      metrics: monitorStore.getState().allProcessMetrics()
    }
  })()

  monitorUpdated = (monitorState) => {
    this.setState({
      metrics: monitorStore.getState().allProcessMetrics()
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
  * @param metric: the process info
  * @return jsx
  */
  renderRow (metric) {
    let description
    if (metric.pid === process.pid) {
      description = 'Task Monitor'
    } else if (metric.type === 'Browser') {
      description = 'Main'
    } else if (metric.description) {
      description = metric.description
    } else if (metric.url) {
      if (metric.url.startsWith('chrome-devtools://')) {
        description = 'Dev Tools'
      } else {
        description = metric.url
      }
    } else {
      description = metric.type
    }

    return (
      <TableRow key={metric.pid}>
        <TableRowColumn style={{width: 100}}>
          {metric.pid}
        </TableRowColumn>
        <TableRowColumn>
          {description}
        </TableRowColumn>
        <TableRowColumn style={{width: 100}}>
          {`${Math.round((metric.memory.workingSetSize || 0) / 1024)} MB`}
        </TableRowColumn>
        <TableRowColumn style={{width: 100}}>
          {metric.cpu.percentCPUUsage === undefined ? '-' : (Math.round(metric.cpu.percentCPUUsage * 100) / 100) + '%'}
        </TableRowColumn>
      </TableRow>
    )
  }

  render () {
    const { metrics } = this.state

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
          {metrics.map((metric) => this.renderRow(metric))}
        </TableBody>
      </Table>
    )
  }
}
