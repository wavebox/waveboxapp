import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'
import {Table, TableBody, TableHead, TableRow, TableCell} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const styles = {
  table: {
    tableLayout: 'fixed'
  },
  headRow: {
    height: 'auto',
    '&>*:last-child': {
      paddingRight: 12
    },
    '&>*:first-child': {
      paddingLeft: 12
    }
  },
  row: {
    height: 'auto',
    '&:nth-of-type(odd)': {
      backgroundColor: lightBlue[50]
    },
    '&>*:last-child': {
      paddingRight: 12
    },
    '&>*:first-child': {
      paddingLeft: 12
    }
  },
  cell: {
    padding: '6px 3px',
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  hCell: {
    padding: '6px 3px',
    textAlign: 'left',
    verticalAlign: 'bottom',
    overflow: 'hidden'
  },
  fixed80: {
    width: 80,
    textAlign: 'right'
  },
  pidCell: {
    width: 70,
    textAlign: 'left'
  }
}

@withStyles(styles)
class ProcessMonitor extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isAdvanced: PropTypes.bool.isRequired
  }

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
    const monitorState = monitorStore.getState()
    return {
      metrics: monitorState.allProcessMetrics()
    }
  })()

  monitorUpdated = (monitorState) => {
    this.setState({
      metrics: monitorState.allProcessMetrics()
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
  * Humanizes bytes
  * @param bytes: the bytes to humanize
  * @param multiplier=1: an optional multiplier to apply to the bytes (e.g. if you're passing KB)
  * @return bytes in a human string
  */
  humanizeBytes (bytes, multiplier = 1) {
    if (typeof (bytes) === 'number') {
      return `${Math.round(bytes * multiplier / 1024 / 1024)} MB`
    } else {
      return '-'
    }
  }

  /**
  * Humanizes percent
  * @param pc: the percent to humanize
  * @return percent in a human string
  */
  humanizePercent (pc) {
    if (typeof (pc) === 'number') {
      return `${Math.round(pc * 100) / 100}%`
    } else {
      return '-'
    }
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
  * @param isAdvanced: true to render advanced mode
  * @param metric: the process info
  * @return jsx
  */
  renderBasicRow (classes, isAdvanced, metric) {
    const osUnreliableIndicator = metric.os.unreliable ? '*' : ''
    if (isAdvanced) {
      return (
        <TableRow key={metric.pid} className={classes.row}>
          <TableCell className={classNames(classes.cell, classes.pidCell)}>
            {metric.pid}
          </TableCell>
          <TableCell className={classNames(classes.cell)}>
            {this.renderDescription(metric)}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizeBytes(metric.os.memory)}
            {osUnreliableIndicator}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizeBytes(metric.chromium.memory.workingSetSize, 1024)}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizeBytes(metric.chromium.memory.peakWorkingSetSize, 1024)}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizeBytes(metric.chromium.memory.privateBytes, 1024)}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizeBytes(metric.chromium.memory.sharedBytes, 1024)}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizePercent(metric.os.cpu)}
            {osUnreliableIndicator}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizePercent(metric.chromium.cpu.percentCPUUsage)}
          </TableCell>
        </TableRow>
      )
    } else {
      return (
        <TableRow key={metric.pid} className={classes.row}>
          <TableCell className={classNames(classes.cell, classes.pidCell)}>
            {metric.pid}
          </TableCell>
          <TableCell className={classNames(classes.cell)}>
            {this.renderDescription(metric)}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizeBytes(metric.os.memory)}
            {osUnreliableIndicator}
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.fixed80)}>
            {this.humanizePercent(metric.chromium.cpu.percentCPUUsage)}
            {osUnreliableIndicator}
          </TableCell>
        </TableRow>
      )
    }
  }

  /**
  * Renders the header
  * @param classes: the classes set
  * @param isAdvanced: true to render advanced mode
  * @return jsx
  */
  renderHead (classes, isAdvanced) {
    if (isAdvanced) {
      return (
        <TableHead>
          <TableRow className={classes.headRow}>
            <TableCell className={classNames(classes.hCell, classes.pidCell)}>Pid</TableCell>
            <TableCell className={classNames(classes.hCell)}>Description</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>OS Memory</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>Working Set</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>Peak Working Set</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>Private Memory</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>Shared Memory</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>OS CPU</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>CR CPU</TableCell>
          </TableRow>
        </TableHead>
      )
    } else {
      return (
        <TableHead>
          <TableRow className={classes.headRow}>
            <TableCell className={classNames(classes.hCell, classes.pidCell)}>Pid</TableCell>
            <TableCell className={classNames(classes.hCell)}>Description</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>Memory</TableCell>
            <TableCell className={classNames(classes.hCell, classes.fixed80)}>CPU</TableCell>
          </TableRow>
        </TableHead>
      )
    }
  }

  render () {
    const { classes, className, isAdvanced, ...passProps } = this.props
    const { metrics } = this.state

    return (
      <Table className={classNames(classes.table, className)} {...passProps}>
        {this.renderHead(classes, isAdvanced)}
        <TableBody>
          {metrics.map((metric) => this.renderBasicRow(classes, isAdvanced, metric))}
        </TableBody>
      </Table>
    )
  }
}

export default ProcessMonitor
