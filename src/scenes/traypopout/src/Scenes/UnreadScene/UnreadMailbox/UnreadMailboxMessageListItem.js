import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar, ListItem } from '@material-ui/core'
import red from '@material-ui/core/colors/red'
import pink from '@material-ui/core/colors/pink'
import purple from '@material-ui/core/colors/purple'
import deepPurple from '@material-ui/core/colors/deepPurple'
import indigo from '@material-ui/core/colors/indigo'
import blue from '@material-ui/core/colors/blue'
import lightBlue from '@material-ui/core/colors/lightBlue'
import cyan from '@material-ui/core/colors/cyan'
import teal from '@material-ui/core/colors/teal'
import green from '@material-ui/core/colors/green'
import lightGreen from '@material-ui/core/colors/lightGreen'
import lime from '@material-ui/core/colors/lime'
import yellow from '@material-ui/core/colors/yellow'
import amber from '@material-ui/core/colors/amber'
import orange from '@material-ui/core/colors/orange'
import deepOrange from '@material-ui/core/colors/deepOrange'
import brown from '@material-ui/core/colors/brown'
import grey from '@material-ui/core/colors/grey'
import blueGrey from '@material-ui/core/colors/blueGrey'
import { withStyles } from '@material-ui/core/styles'

const avatarColorPalette = [
  [red[800], red[100]],
  [pink[800], pink[100]],
  [purple[800], purple[100]],
  [deepPurple[800], deepPurple[100]],
  [indigo[800], indigo[100]],
  [blue[800], blue[100]],
  [lightBlue[800], lightBlue[100]],
  [cyan[800], cyan[100]],
  [teal[800], teal[100]],
  [green[800], green[100]],
  [lightGreen[800], lightGreen[100]],
  [lime[800], lime[100]],
  [yellow[800], yellow[100]],
  [amber[800], amber[100]],
  [orange[800], orange[100]],
  [deepOrange[800], deepOrange[100]],
  [brown[800], brown[100]],
  [grey[800], grey[100]],
  [blueGrey[800], blueGrey[100]]
]

const styles = {
  avatar: {
    width: 35,
    height: 35,
    alignSelf: 'flex-start',
    marginRight: 10,
    marginTop: 5
  },
  listItem: {
    paddingTop: 8,
    paddingBottom: 8,
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${grey[100]}`
  },
  messageText: {
    marginLeft: 75
  },
  primaryMessageText: {
    fontSize: 14
  },
  secondaryMessageText: {
    fontSize: 13
  }
}

@withStyles(styles)
class UnreadMailboxMessageListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    message: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the avatar
  * @param classes: the classes to use
  * @param extended: the extended info
  * @return jsx or undefined
  */
  renderAvatar (classes, extended) {
    if (extended.optAvatarText) {
      const charCode = extended.optAvatarText.toLowerCase().charCodeAt(0)
      const [backgroundColor, color] = avatarColorPalette[charCode % avatarColorPalette.length]
      return (
        <Avatar
          className={classes.avatar}
          style={{ backgroundColor: backgroundColor, color: color }}>
          {extended.optAvatarText}
        </Avatar>
      )
    }

    return undefined
  }

  render () {
    const { message, classes, ...passProps } = this.props

    if (message.extended) {
      return (
        <ListItem className={classes.listItem} button {...passProps}>
          {this.renderAvatar(classes, message.extended)}
          <span>
            <span className={classes.primaryMessageText}>{message.text}</span>
            <div style={styles.secondaryMessageText}>{message.extended.subtitle}</div>
          </span>
        </ListItem>
      )
    } else {
      return (
        <ListItem className={classes.listItem} button {...passProps}>
          <div className={classes.avatar} />
          <span className={classes.primaryMessageText}>{message.text}</span>
        </ListItem>
      )
    }
  }
}

export default UnreadMailboxMessageListItem
