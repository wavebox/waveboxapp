import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'
import {Table, TableBody, TableHead, TableRow, TableCell} from 'material-ui'
import { withStyles } from 'material-ui/styles'
import lightBlue from 'material-ui/colors/lightBlue'
import classNames from 'classnames'

const styles = {
  table: {
    tableLayout: 'fixed'
  },
  headRow: {
    height: 'auto'
  },
  row: {
    height: 'auto',
    '&:nth-of-type(odd)': {
      backgroundColor: lightBlue[50]
    }
  },
  cell: {
    padding: '6px 12px',
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  fixed100: {
    width: 100
  }
}

@withStyles(styles)
class ProcessMonitor extends React.Component {
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
  * Sanitizes the description url
  * @param url: the url
  * @return a sanitized version of the url
  */
  sanitizeDescriptionUrl (url) {
    if (url) {
      if (url.startsWith('chrome-devtools://')) { return 'Devtools' }
    }
    return url
  }

  /**
  * Renders a description for a metric
  * @param metric: the metric to get info from
  * @return jsx
  */
  renderDescription (metric) {
    if (metric.webContentsInfo && metric.webContentsInfo.length) {
      if (metric.webContentsInfo.length === 1) {
        const info = metric.webContentsInfo[0]
        return info.description || this.sanitizeDescriptionUrl(info.url) || 'about:blank'
      } else {
        return (
          <div>
            {metric.webContentsInfo.map((info) => {
              return (
                <div key={info.webContentsId}>
                  • {info.description || this.sanitizeDescriptionUrl(info.url) || 'about:blank'}
                </div>
              )
            })}
          </div>
        )
      }
    } else if (metric.type === 'Browser') {
      return 'Wavebox Main'
    } else {
      return metric.type
    }
  }

  /**
  * Renders a row
  * @param classes: the classes set
  * @param metric: the process info
  * @return jsx
  */
  renderRow (classes, metric) {
    return (
      <TableRow key={metric.pid} className={classes.row}>
        <TableCell className={classNames(classes.cell, classes.fixed100)}>
          {metric.pid}
        </TableCell>
        <TableCell className={classNames(classes.cell)}>
          {this.renderDescription(metric)}
        </TableCell>
        <TableCell className={classNames(classes.cell, classes.fixed100)}>
          {`${Math.round((metric.memory.workingSetSize || 0) / 1024)} MB`}
        </TableCell>
        <TableCell className={classNames(classes.cell, classes.fixed100)}>
          {metric.cpu.percentCPUUsage === undefined ? '-' : (Math.round(metric.cpu.percentCPUUsage * 100) / 100) + '%'}
        </TableCell>
      </TableRow>
    )
  }

  render () {
    const { classes } = this.props
    const { metrics } = this.state

    return (
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.headRow}>
            <TableCell className={classNames(classes.cell, classes.fixed100)}>Pid</TableCell>
            <TableCell className={classNames(classes.cell)}>Description</TableCell>
            <TableCell className={classNames(classes.cell, classes.fixed100)}>Memory</TableCell>
            <TableCell className={classNames(classes.cell, classes.fixed100)}>CPU</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((metric) => this.renderRow(classes, metric))}
        </TableBody>
      </Table>
    )
  }
}

export default ProcessMonitor
