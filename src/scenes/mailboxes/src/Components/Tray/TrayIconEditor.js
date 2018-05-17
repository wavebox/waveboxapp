import PropTypes from 'prop-types'
import React from 'react'
import {Row, Col} from '../Grid'
import ColorPickerButton from 'wbui/ColorPickerButton'
import TrayPreview from './TrayPreview'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'
import BorderColorIcon from '@material-ui/icons/BorderColor'
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'

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
  },
  buttonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
export default class TrayIconEditor extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tray: PropTypes.object.isRequired,
    trayPreviewStyles: PropTypes.object,
    trayHeadingStyles: PropTypes.object,
    trayPreviewClassName: PropTypes.string,
    trayHeadingClassName: PropTypes.string
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      tray,
      trayPreviewStyles,
      trayHeadingStyles,
      trayPreviewClassName,
      trayHeadingClassName,
      classes,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <Row>
          <Col xs={6}>
            <h1 className={classNames(trayHeadingClassName, classes.subheading)} style={trayHeadingStyles}>All Messages Read</h1>
            <div className={classes.button}>
              <ColorPickerButton
                buttonProps={{ variant: 'raised' }}
                disabled={!tray.show}
                value={tray.readColor}
                onChange={(col) => settingsActions.sub.tray.setTrayReadColor(col.rgbaStr)}>
                <BorderColorIcon className={classes.buttonIcon} />
                Border
              </ColorPickerButton>
            </div>
            <div className={classes.button}>
              <ColorPickerButton
                buttonProps={{ variant: 'raised' }}
                disabled={!tray.show}
                value={tray.readBackgroundColor}
                onChange={(col) => settingsActions.sub.tray.setTrayReadBackgroundColor(col.rgbaStr)}>
                <FormatColorFillIcon className={classes.buttonIcon} />
                Background
              </ColorPickerButton>
            </div>
            <TrayPreview className={trayPreviewClassName} style={trayPreviewStyles} size={100} tray={tray} unreadCount={0} />
          </Col>
          <Col xs={6}>
            <h1 className={classNames(trayHeadingClassName, classes.subheading)} style={trayHeadingStyles}>Unread Messages</h1>
            <div className={classes.button}>
              <ColorPickerButton
                buttonProps={{ variant: 'raised' }}
                disabled={!tray.show}
                value={tray.unreadColor}
                onChange={(col) => settingsActions.sub.tray.setTrayUnreadColor(col.rgbaStr)}>
                <BorderColorIcon className={classes.buttonIcon} />
                Border
              </ColorPickerButton>
            </div>
            <div className={classes.button}>
              <ColorPickerButton
                buttonProps={{ variant: 'raised' }}
                disabled={!tray.show}
                value={tray.unreadBackgroundColor}
                onChange={(col) => settingsActions.sub.tray.setTrayUnreadBackgroundColor(col.rgbaStr)}>
                <FormatColorFillIcon className={classes.buttonIcon} />
                Background
              </ColorPickerButton>
            </div>
            <TrayPreview className={trayPreviewClassName} style={trayPreviewStyles} size={100} tray={tray} unreadCount={1} />
          </Col>
        </Row>
      </div>
    )
  }
}
