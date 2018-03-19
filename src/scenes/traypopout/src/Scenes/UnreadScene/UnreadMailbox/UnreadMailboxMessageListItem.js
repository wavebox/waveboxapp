import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar, ListItem } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'

const avatarColorPalette = [
  [Colors.red800, Colors.red100],
  [Colors.pink800, Colors.pink100],
  [Colors.purple800, Colors.purple100],
  [Colors.deepPurple800, Colors.deepPurple100],
  [Colors.indigo800, Colors.indigo100],
  [Colors.blue800, Colors.lightBlue100],
  [Colors.cyan800, Colors.cyan100],
  [Colors.teal800, Colors.teal100],
  [Colors.green800, Colors.green100],
  [Colors.lightGreen800, Colors.lightGreen100],
  [Colors.lime800, Colors.lime100],
  [Colors.yellow800, Colors.yellow100],
  [Colors.amber800, Colors.amber100],
  [Colors.orange800, Colors.orange100],
  [Colors.deepOrange800, Colors.deepOrange100],
  [Colors.brown800, Colors.brown100],
  [Colors.grey800, Colors.grey100],
  [Colors.blueGrey800, Colors.blueGrey100]
]

const styles = {
  listItem: {
    paddingTop: 8,
    paddingBottom: 8
  },
  primaryMessageText: {
    fontSize: 14
  },
  secondaryMessageText: {
    fontSize: 13
  }
}

export default class UnreadMailboxMessageListItem extends React.Component {
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
  * @param extended: the extended info
  * @return jsx or undefined
  */
  renderAvatar (extended) {
    if (extended.optAvatarText) {
      const charCode = extended.optAvatarText.toLowerCase().charCodeAt(0)
      const [backgroundColor, color] = avatarColorPalette[charCode % avatarColorPalette.length]
      return (
        <Avatar
          color={color}
          backgroundColor={backgroundColor}
          size={35}
          style={{top: 8}}>
          {extended.optAvatarText}
        </Avatar>
      )
    }

    return undefined
  }

  render () {
    const { message, ...passProps } = this.props

    if (message.extended) {
      return (
        <ListItem
          innerDivStyle={styles.listItem}
          leftAvatar={this.renderAvatar(message.extended)}
          primaryText={(<div style={styles.primaryMessageText}>{message.extended.title}</div>)}
          secondaryText={(<div style={styles.secondaryMessageText}>{message.extended.subtitle}</div>)}
          {...passProps} />
      )
    } else {
      return (
        <ListItem
          innerDivStyle={styles.listItem}
          primaryText={(<span style={styles.primaryMessageText}>{message.text}</span>)}
          {...passProps} />
      )
    }
  }
}
