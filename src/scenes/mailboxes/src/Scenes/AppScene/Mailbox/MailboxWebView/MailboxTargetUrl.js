import PropTypes from 'prop-types'
import React from 'react'
import { Paper } from 'material-ui'

export default class MailboxTargetUrl extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { url, ...passProps } = this.props

    const className = [
      'ReactComponent-MailboxTargetUrl',
      url ? 'active' : undefined
    ].concat(this.props.className).filter((c) => !!c).join(' ')
    return (
      <Paper {...passProps} className={className}>
        {url}
      </Paper>
    )
  }
}
