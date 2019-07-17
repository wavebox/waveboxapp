import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ExtensionListItem from './ExtensionListItem'
import grey from '@material-ui/core/colors/grey'
import { withStyles } from '@material-ui/core/styles'
import KRXFramework from 'Runtime/KRXFramework'

const styles = {
  heading: {
    marginTop: 30,
    color: grey[900],
    fontWeight: 'normal',
    marginBottom: 10
  }
}

@withStyles(styles)
class InstalledExtensionList extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      extensionIds: KRXFramework.extensionIds()
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, classes, ...passProps } = this.props
    const { extensionIds } = this.state

    return (
      <div {...passProps}>
        <h1 className={classes.heading}>Installed Extensions</h1>
        {extensionIds.length ? extensionIds.map((id) => {
          return (
            <ExtensionListItem
              key={id}
              extensionId={id}
              showRestart={showRestart} />
          )
        }) : (
          <div>You don't have any extensions installed...</div>
        )}
      </div>
    )
  }
}

export default InstalledExtensionList
