import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'

export default class MailboxLoadBar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isLoading: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      isLoading,
      className,
      ...passProps
    } = this.props

    const fullClassName = classnames(
      'ReactComponent-MailboxLoadBar',
      isLoading ? 'loading' : undefined,
      className
    )

    return (
      <div className={fullClassName} {...passProps} />
    )
  }
}
