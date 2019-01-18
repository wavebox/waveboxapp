import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { Menu, MenuItem } from '@material-ui/core'
import electron from 'electron'

const styles = {
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: "#273238",
    color: "#FFF",
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center'
  },
  rootButton: {
    fontSize: 12,
    display: 'inline-block',
    height: '100%',
    paddingLeft: 8,
    paddingRight: 8,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  title: {
    display: 'inline-block',
    fontWeight: 'bold'
  }
}

@withStyles(styles)
class WindowTitlebar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {

  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    electron.remote.getCurrentWindow().on('page-title-updated', this.handlePageTitleChanged)
  }

  componentWillUnmount () {
    electron.remote.getCurrentWindow().removeListener('page-title-updated', this.handlePageTitleChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    anchor: null,
    menu: null,
    title: document.title
  }

  handlePageTitleChanged = (evt, title) => {
    this.setState({ title: title })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClickMenu = (evt, name) => {
    const target = evt.target
    this.setState((prevState) => {
      if (prevState.menu === name) {
        return { anchor: null, menu: null }
      } else {
        return { anchor: target, menu: name }
      }
    })
  }

  handleHoverMenu = (evt, name) => {
    const target = evt.target
    this.setState((prevState) => {
      if (prevState.anchor) {
        return {
          anchor: target,
          menu: name
        }
      } else {
        return undefined
      }
    })
  }

  handleCloseMenu = () => {
    this.setState({
      anchor: null,
      menu: null
    })
  }

  /* **************************************************************************/
  // Render
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderMenu (menu, anchor, name) {
    return (
      <Menu
        MenuListProps={{ dense: true }}
        disableAutoFocusItem
        anchorEl={menu===name ? anchor : undefined}
        open={menu===name} onClose={this.handleCloseMenu}>
        <MenuItem>Item A</MenuItem>
        <MenuItem>Item B</MenuItem>
        <MenuItem>Item C</MenuItem>
      </Menu>
    )
  }

  render () {
    const {
      classes,
      className,
      ...passProps
    } = this.props
    const {
      anchor,
      menu,
      title
    } = this.state

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        <div className={classes.title}>
          {title}
        </div>
        <div
          className={classes.rootButton}
          onMouseEnter={(e) => this.handleHoverMenu(e, 'file')}
          onClick={(e) => this.handleClickMenu(e, 'file')}>
          File
        </div>
        <div
          className={classes.rootButton}
          onMouseEnter={(e) => this.handleHoverMenu(e, 'edit')}
          onClick={(e) => this.handleClickMenu(e, 'edit')}>
          Edit
        </div>
        <div
          className={classes.rootButton}
          onMouseEnter={(e) => this.handleHoverMenu(e, 'view')}
          onClick={(e) => this.handleClickMenu(e, 'view')}>
          View
        </div>
        {this.renderMenu(menu, anchor, 'file')}
        {this.renderMenu(menu, anchor, 'edit')}
        {this.renderMenu(menu, anchor, 'view')}
      </div>
    )
  }
}

export default WindowTitlebar
