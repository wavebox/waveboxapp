import React from 'react'
import PropTypes from 'prop-types'
import RouterDialogController from './RouterDialogController'
import { Route } from 'react-router'

export default class RouterDialogRoute extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    path: PropTypes.string.isRequired,
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { path, routeName, ...passProps } = this.props

    return (
      <Route
        path={path}
        {...passProps}
        render={(props) => (<RouterDialogController {...props} routeName={routeName} />)} />
    )
  }
}
