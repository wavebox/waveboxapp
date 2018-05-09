import './MonitorTable.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { monitorStore } from 'stores/monitor'

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
  * @param metric: the process info
  * @return jsx
  */
  renderRow (metric) {
    return (
      <tr key={metric.pid}>
        <td className='fixed-100'>
          {metric.pid}
        </td>
        <td>
          {this.renderDescription(metric)}
        </td>
        <td className='fixed-100'>
          {`${Math.round((metric.memory.workingSetSize || 0) / 1024)} MB`}
        </td>
        <td className='fixed-100'>
          {metric.cpu.percentCPUUsage === undefined ? '-' : (Math.round(metric.cpu.percentCPUUsage * 100) / 100) + '%'}
        </td>
      </tr>
    )
  }

  render () {
    const { metrics } = this.state

    return (
      <table className='RC-MonitorTable'>
        <thead>
          <tr>
            <th className='fixed-100'>Pid</th>
            <th>Description</th>
            <th className='fixed-100'>Memory</th>
            <th className='fixed-100'>CPU</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => this.renderRow(metric))}
        </tbody>
      </table>
    )
  }
}
