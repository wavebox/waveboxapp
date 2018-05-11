import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'
import {Table, TableBody, TableHead, TableRow, TableCell} from 'material-ui'
import green from 'material-ui/colors/green'
import amber from 'material-ui/colors/amber'
import red from 'material-ui/colors/red'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import WarningIcon from '@material-ui/icons/Warning'
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
  },
  fixed150: {
    width: 150
  },
  icon: {
    width: 100,
    textAlign: 'center',
    padding: 0
  }
}

@withStyles(styles)
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
  * @param classes: the classes to use
  * @param conn: the connection info
  * @param index: the connection index
  * @return jsx
  */
  renderRow (classes, conn, index) {
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
      <TableRow key={key} className={classes.row}>
        <TableCell className={classNames(classes.cell, classes.fixed100)}>
          {conn.pid}
        </TableCell>
        <TableCell className={classNames(classes.cell)}>
          {conn.description || '-'}
        </TableCell>
        <TableCell className={classNames(classes.cell, classes.icon)}>
          {conn.isSetup ? (
            <CheckCircleIcon style={{ color: green['600'] }} />
          ) : (
            <CancelIcon style={{ color: red['600'] }} />
          )}
        </TableCell>
        <TableCell className={classNames(classes.cell, classes.icon)}>
          {conn.isConnected ? (
            <CheckCircleIcon style={{ color: green['600'] }} />
          ) : (
            <CancelIcon style={{ color: red['600'] }} />
          )}
        </TableCell>
        <TableCell className={classNames(classes.cell, classes.icon)}>
          {conn.isUnderMaintenance ? (
            <WarningIcon style={{ color: amber['600'] }} />
          ) : (
            <CheckCircleIcon style={{ color: green['600'] }} />
          )}
        </TableCell>
        <TableCell className={classNames(classes.cell, classes.fixed150)}>
          {conn.connectionMode}
        </TableCell>
      </TableRow>
    )
  }

  render () {
    const { classes } = this.props
    const { connections } = this.state

    return (
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.headRow}>
            <TableCell className={classNames(classes.cell, classes.fixed100)}>Pid</TableCell>
            <TableCell className={classNames(classes.cell)}>Description</TableCell>
            <TableCell className={classNames(classes.cell, classes.icon)}>Setup</TableCell>
            <TableCell className={classNames(classes.cell, classes.icon)}>Connected</TableCell>
            <TableCell className={classNames(classes.cell, classes.icon)}>Maintenance</TableCell>
            <TableCell className={classNames(classes.cell, classes.fixed150)}>Mode</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {connections.map((conn, i) => this.renderRow(classes, conn, i))}
        </TableBody>
      </Table>
    )
  }
}
