import PropTypes from 'prop-types'
import React from 'react'
import { FontIcon } from 'material-ui'
import {Row, Col} from '../Grid'
import ColorPickerButton from '../ColorPickerButton'
import TrayPreview from './TrayPreview'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  subheading: {
    marginTop: 0,
    marginBottom: 10,
    color: '#CCC',
    fontWeight: '300',
    fontSize: 16
  },
  button: {
    marginTop: 5,
    marginBottom: 5
  }
}

export default class TrayIconEditor extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tray: PropTypes.object.isRequired,
    trayPreviewStyles: PropTypes.object
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {tray, trayPreviewStyles, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Row>
          <Col xs={6}>
            <h1 style={styles.subheading}>All Messages Read</h1>
            <div style={styles.button}>
              <ColorPickerButton
                label='Border'
                icon={<FontIcon className='material-icons'>border_color</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.readColor}
                onChange={(col) => settingsActions.setTrayReadColor(col.rgbaStr)} />
            </div>
            <div style={styles.button}>
              <ColorPickerButton
                label='Background'
                icon={<FontIcon className='material-icons'>format_color_fill</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.readBackgroundColor}
                onChange={(col) => settingsActions.setTrayReadBackgroundColor(col.rgbaStr)} />
            </div>
            <TrayPreview style={trayPreviewStyles} size={100} tray={tray} unreadCount={0} />
          </Col>
          <Col xs={6}>
            <h1 style={styles.subheading}>Unread Messages</h1>
            <div style={styles.button}>
              <ColorPickerButton
                label='Border'
                icon={<FontIcon className='material-icons'>border_color</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.unreadColor}
                onChange={(col) => settingsActions.setTrayUnreadColor(col.rgbaStr)} />
            </div>
            <div style={styles.button}>
              <ColorPickerButton
                label='Background'
                icon={<FontIcon className='material-icons'>format_color_fill</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.unreadBackgroundColor}
                onChange={(col) => settingsActions.setTrayUnreadBackgroundColor(col.rgbaStr)} />
            </div>
            <TrayPreview style={trayPreviewStyles} size={100} tray={tray} unreadCount={1} />
          </Col>
        </Row>
      </div>
    )
  }
}
