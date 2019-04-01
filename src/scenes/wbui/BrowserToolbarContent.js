import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IconButton, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { CHROME_PDF_URL } from 'shared/constants'
import { URL } from 'url'
import Spinner from 'wbui/Activity/Spinner'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import CloseIcon from '@material-ui/icons/Close'
import RefreshIcon from '@material-ui/icons/Refresh'
import SearchIcon from '@material-ui/icons/Search'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import ThemeTools from 'wbui/Themes/ThemeTools'
import classNames from 'classnames'
import FASFileDownload from 'wbfa/FASFileDownload'
import HomeIcon from '@material-ui/icons/Home'

const styles = (theme) => ({
  // Layout
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    height: '100%'
  },

  // Icons
  iconButton: {
    WebkitAppRegion: 'no-drag'
  },
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color', 'hover')
    },
    '&.is-disabled': {
      color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color', 'disabled'),
      '&:hover': {
        color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color', 'disabled')
      }
    }
  },
  faIcon: {
    fontSize: '18px'
  },

  // Address
  addressGroup: {
    display: 'flex',
    width: '100%',
    height: '100%',
    textAlign: 'left',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden'
  },
  address: {
    position: 'relative',
    width: 'auto',
    minWidth: 100,
    maxWidth: '100%',
    height: 30,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: '14px',
    backgroundColor: 'transparent',
    border: 'none',
    color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.text.color'),
    borderRadius: 10,
    paddingLeft: 4,
    paddingRight: 4,
    WebkitAppRegion: 'no-drag',

    '&.fullwidth': {
      width: '100%'
    },

    '&:focus': {
      outline: 'none',
      width: '100%',
      backgroundColor: '#FFF',
      border: '2px solid #EEE',
      color: '#202124'
    }
  },
  loadingContainer: {
    width: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

@withStyles(styles, { withTheme: true })
class BrowserToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    // State
    address: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    canGoBack: PropTypes.bool.isRequired,
    canGoForward: PropTypes.bool.isRequired,

    // Features
    hasGoBack: PropTypes.bool.isRequired,
    hasGoForward: PropTypes.bool.isRequired,
    hasStopAndReload: PropTypes.bool.isRequired,
    hasLoadingSpinner: PropTypes.bool.isRequired,
    hasHome: PropTypes.bool.isRequired,
    hasDownload: PropTypes.bool.isRequired,
    hasSearch: PropTypes.bool.isRequired,
    hasOpenInBrowser: PropTypes.bool.isRequired,

    // Functions
    onGoBack: PropTypes.func,
    onGoForward: PropTypes.func,
    onStop: PropTypes.func,
    onReload: PropTypes.func,
    onHome: PropTypes.func,
    onDownload: PropTypes.func,
    onSearch: PropTypes.func,
    onOpenInBrowser: PropTypes.func,
    onBlurAddress: PropTypes.func,
    onFocusAddress: PropTypes.func,
    onChangeAddress: PropTypes.func,
    fullWidthAddress: PropTypes.bool.isRequired
  }

  static defaultProps = {
    hasGoBack: true,
    hasGoForward: true,
    hasStopAndReload: true,
    hasLoadingSpinner: true,
    hasHome: false,
    hasDownload: false,
    hasSearch: false,
    hasOpenInBrowser: false,
    fullWidthAddress: true
  }

  /* **************************************************************************/
  // Lifecylce
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.addressRef = React.createRef()
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  focusAddress = () => {
    this.addressRef.current.focus()
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.address !== nextProps.address) {
      this.setState((prevState) => {
        if (prevState.addressInEdit === false) {
          return { addressEdit: '' }
        } else {
          return {}
        }
      })
    }
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    return {
      addressInEdit: false,
      addressEdit: ''
    }
  })()

  /* **************************************************************************/
  // Urls
  /* **************************************************************************/

  /**
  * Converts a url to a url that can be shown and used externally
  * @param url: the true url
  * @return the url to load in external browsers and show to the user
  */
  humanizeUrl (targetUrl) {
    if (this.isPDFUrl(targetUrl)) {
      try {
        return new URL(targetUrl).searchParams.get('src')
      } catch (ex) {
        return targetUrl
      }
    } else if (this.isBlankUrl(targetUrl)) {
      return ''
    } else {
      return targetUrl
    }
  }

  /**
  * @param targetUrl: the current url
  * @return true if this is a blank url
  */
  isBlankUrl (targetUrl) {
    return !targetUrl || targetUrl === 'about:blank'
  }

  /**
  * @param targetUrl: the current url
  * @return true if this url is a pdf url
  */
  isPDFUrl (targetUrl) {
    return targetUrl && targetUrl.startsWith(CHROME_PDF_URL)
  }

  /**
  * @param targetUrl: the url to check
  * @return true if we can download this url
  */
  isDownloadableUrl (targetUrl) {
    if (this.isPDFUrl(targetUrl)) { return true }

    return false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the current page in the default browser
  * @param evt: the event that fired
  */
  handleOpenInBrowser = (evt) => {
    if (this.props.onOpenInBrowser) {
      this.props.onOpenInBrowser(evt, this.humanizeUrl(this.props.address))
    }
  }

  /**
  * Downloads the current page
  * @param evt: the event that fired
  */
  handleDownload = (evt) => {
    if (this.props.onDownload) {
      this.props.onDownload(evt, this.humanizeUrl(this.props.address))
    }
  }

  /* **************************************************************************/
  // UI Events: Address
  /* **************************************************************************/

  /**
  * Handles the address moving into focus
  * @param evt: the event that fired
  */
  handleFocusAddress = (evt) => {
    const element = evt.target
    element.select()
    setTimeout(() => element.select(), 50)

    const { address, onFocusAddress } = this.props
    this.setState((prevState) => {
      return {
        addressInEdit: true,
        addressEdit: prevState.addressEdit || this.humanizeUrl(address)
      }
    })

    if (onFocusAddress) {
      onFocusAddress(evt)
    }
  }

  /**
  * Handles the address moving out of focus
  * @param evt: the event that fired
  */
  handleBlurAddress = (evt) => {
    const { onBlurAddress } = this.props
    this.setState({
      addressInEdit: false
    })

    if (onBlurAddress) {
      onBlurAddress(evt)
    }
  }

  /**
  * Handles the address field changing
  * @param evt: the event that fired
  */
  handleChangeAddress = (evt) => {
    this.setState({ addressEdit: evt.target.value })
  }

  /**
  * Handles the keydown event on the address
  * @param evt: the event that fired
  */
  handleKeydownAddress = (evt) => {
    if (evt.keyCode === 13) {
      this.handleFireAddressChange(evt, this.state.addressEdit)
    }
  }

  /**
  * Handles firing an address change
  * @param evt: an upstream event
  * @param address: the new address (unvalidated)
  */
  handleFireAddressChange = (evt, address) => {
    address = address.startsWith('https://') || address.startsWith('http://')
      ? address
      : `https://${address}`

    let isValid = false
    try {
      new URL(address) // eslint-disable-line
      isValid = true
    } catch (ex) {
      isValid = false
    }

    if (isValid) {
      this.addressRef.current.blur()
      if (this.props.onChangeAddress) {
        this.props.onChangeAddress(evt, address)
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      className,
      theme,
      address,
      isLoading,
      canGoBack,
      canGoForward,
      hasGoBack,
      hasGoForward,
      hasStopAndReload,
      hasLoadingSpinner,
      hasHome,
      hasDownload,
      hasSearch,
      hasOpenInBrowser,
      onGoBack,
      onGoForward,
      onStop,
      onReload,
      onHome,
      onDownload,
      onSearch,
      onOpenInBrowser,
      onBlurAddress,
      onFocusAddress,
      onChangeAddress,
      fullWidthAddress,
      ...passProps
    } = this.props
    const {
      addressInEdit,
      addressEdit
    } = this.state

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        <div className={classes.group}>
          {hasHome ? (
            <IconButton className={classes.iconButton} onClick={onHome}>
              <HomeIcon className={classes.icon} />
            </IconButton>
          ) : undefined}
          {hasGoBack ? (
            <IconButton
              className={classes.iconButton}
              disableRipple={!canGoBack}
              onClick={canGoBack ? onGoBack : undefined}>
              <ArrowBackIcon className={classNames(classes.icon, !canGoBack ? 'is-disabled' : undefined)} />
            </IconButton>
          ) : undefined}
          {hasGoForward ? (
            <IconButton
              className={classes.iconButton}
              disableRipple={!canGoForward}
              onClick={canGoForward ? onGoForward : undefined}>
              <ArrowForwardIcon className={classNames(classes.icon, !canGoForward ? 'is-disabled' : undefined)} />
            </IconButton>
          ) : undefined}
          {hasStopAndReload ? (
            <IconButton className={classes.iconButton} onClick={isLoading ? onStop : onReload}>
              {isLoading ? (
                <CloseIcon className={classes.icon} />
              ) : (
                <RefreshIcon className={classes.icon} />
              )}
            </IconButton>
          ) : undefined}
        </div>
        <div className={classes.addressGroup}>
          <input
            ref={this.addressRef}
            onBlur={this.handleBlurAddress}
            onFocus={this.handleFocusAddress}
            onChange={this.handleChangeAddress}
            onKeyDown={this.handleKeydownAddress}
            type='text'
            size={`${addressInEdit ? addressEdit : this.humanizeUrl(address)}`.length}
            className={classNames(classes.address, fullWidthAddress ? 'fullwidth' : undefined)}
            value={addressInEdit ? addressEdit : this.humanizeUrl(address)} />
        </div>
        <div className={classes.group}>
          {hasLoadingSpinner ? (
            <div className={classes.loadingContainer}>
              {isLoading ? (
                <Spinner
                  size={15}
                  color={ThemeTools.getValue(theme, 'wavebox.toolbar.spinner.color')} />
              ) : undefined}
            </div>
          ) : undefined}
          {hasSearch ? (
            <Tooltip title='Find in Page'>
              <IconButton className={classes.iconButton} onClick={onSearch}>
                <SearchIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
          ) : undefined}
          {hasDownload && this.isDownloadableUrl(address) ? (
            <Tooltip title='Download'>
              <IconButton className={classes.iconButton} onClick={this.handleDownload}>
                <FASFileDownload className={classNames(classes.icon, classes.faIcon)} />
              </IconButton>
            </Tooltip>
          ) : undefined}
          {hasOpenInBrowser ? (
            <Tooltip title='Open in Browser' placement='bottom-start'>
              <IconButton className={classes.iconButton} onClick={this.handleOpenInBrowser}>
                <OpenInBrowserIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
          ) : undefined}
        </div>
      </div>
    )
  }
}

export default BrowserToolbar
