import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import Scrollspy from 'react-scrollspy'
import StyleMixins from 'wbui/Styles/StyleMixins'
import uuid from 'uuid'
import { List, ListItem, ListItemText, Paper } from '@material-ui/core'
import lightBlue from '@material-ui/core/colors/lightBlue'
import { accountStore } from 'stores/account'
import MailboxSettingsSection from './Sections/MailboxSettingsSection'
import ServiceSettingsSection from './Sections/ServiceSettingsSection'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import BuildIcon from '@material-ui/icons/Build'
import TuneIcon from '@material-ui/icons/Tune'
import ListIcon from '@material-ui/icons/List'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import AccountServicesHeading from './AccountServicesHeading'
import ServiceAvatar from 'Components/Backed/ServiceAvatar'

const CONTENT_WIDTH = 600
const SCROLLSPY_WIDTH = 210

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden'
  },
  scroller: {
    position: 'absolute',
    top: 0,
    left: SCROLLSPY_WIDTH,
    bottom: 0,
    right: 0,
    paddingBottom: 200,
    scrollBehavior: 'smooth',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  scrollspy: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCROLLSPY_WIDTH,
    maxHeight: '100%',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  scrollspyList: {
    paddingTop: 0,
    paddingBottom: 0
  },
  scrollspyItem: {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 14,

    '&.is-current': {
      backgroundColor: lightBlue[600],
      color: 'white'
    }
  },
  scrollspyIcon: {
    marginRight: 6
  },
  scrollspyTextContainer: {
    paddingRight: 0
  },
  scrollspyText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  scrollspyServiceIcon: {
    marginLeft: 2,
    marginRight: -6
  },
  [`@media (max-width: ${CONTENT_WIDTH + (SCROLLSPY_WIDTH)}px)`]: {
    scroller: {
      left: 0
    },
    scrollspy: {
      display: 'none'
    }
  }
}

@withStyles(styles)
class AccountSettingsScroller extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    startServiceId: PropTypes.string,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
    this.scrollerRef = null
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    this.renderServicesTO = setTimeout(() => {
      this.setState({ renderServices: true })
    }, this.props.startServiceId ? 100 : 500)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    clearTimeout(this.renderServicesTO)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      const accountState = accountStore.getState()
      const services = accountState.mailboxServices(nextProps.mailboxId)
      return {
        services: services,
        serviceDisplayNames: services.map((service) => accountState.resolvedServiceDisplayName(service.id))
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const services = accountState.mailboxServices(this.props.mailboxId)
    return {
      renderServices: false,
      services: services,
      serviceDisplayNames: services.map((service) => accountState.resolvedServiceDisplayName(service.id))
    }
  })()

  accountChanged = (accountState) => {
    const services = accountState.mailboxServices(this.props.mailboxId)
    this.setState({
      services: services,
      serviceDisplayNames: services.map((service) => accountState.resolvedServiceDisplayName(service.id))
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Scrolls to a section
  */
  scrollToSection = (evt, sectionName) => {
    const scroller = ReactDOM.findDOMNode(this.scrollerRef)
    const target = scroller.querySelector(`#${sectionName}`)
    if (target) {
      scroller.scrollTop = target.offsetTop
    }
  }

  /* **************************************************************************/
  // Render
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.startServiceId) {
      if (prevState.renderServices === false && this.state.renderServices === true) {
        this.scrollToSection({}, `service-section-${this.props.startServiceId}`)
      }
    }
  }

  render () {
    const {
      classes,
      className,
      mailboxId,
      startServiceId,
      showRestart,
      onRequestEditCustomCode,
      ...passProps
    } = this.props
    const {
      services,
      serviceDisplayNames,
      renderServices
    } = this.state

    const scrollspyIds = [
      `mailbox-appearance-${mailboxId}`,
      `mailbox-services-${mailboxId}`,
      `mailbox-credentials-$${mailboxId}`,
      `mailbox-advanced-${mailboxId}`,
      `mailbox-tools-${mailboxId}`
    ].concat(
      services.map((s) => `service-section-${s.id}`)
    )

    return (
      <div
        className={classNames(className, classes.root)}
        id={`RC-AccountSettingsScroller--${this.instanceId}`}
        {...passProps}>
        <div className={classes.scroller} ref={(n) => { this.scrollerRef = n }}>
          <MailboxSettingsSection
            mailboxId={mailboxId}
            showRestart={showRestart}
            onRequestEditCustomCode={onRequestEditCustomCode} />
          <AccountServicesHeading mailboxId={mailboxId} />
          {services.map((service) => {
            return (
              <div key={service.id} id={`service-section-${service.id}`}>
                {renderServices ? (
                  <ServiceSettingsSection
                    serviceId={service.id}
                    showRestart={showRestart}
                    onRequestEditCustomCode={onRequestEditCustomCode} />
                ) : undefined}
              </div>
            )
          })}
        </div>
        <Paper className={classes.scrollspy}>
          <List dense className={classes.scrollspyList}>
            <Scrollspy
              rootEl={`#RC-AccountSettingsScroller--${this.instanceId} .${classes.scroller}`}
              componentTag='div'
              items={scrollspyIds}
              currentClassName='is-current'>
              <ListItem
                divider
                button
                dense
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, `mailbox-appearance-${mailboxId}`)}>
                <ViewQuiltIcon className={classes.scrollspyIcon} />
                Appearance
              </ListItem>
              <ListItem
                divider
                button
                dense
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, `mailbox-services-${mailboxId}`)}>
                <ListIcon className={classes.scrollspyIcon} />
                Services
              </ListItem>
              <ListItem
                divider
                button
                dense
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, `mailbox-credentials-${mailboxId}`)}>
                <FingerprintIcon className={classes.scrollspyIcon} />
                Credentials
              </ListItem>
              <ListItem
                divider
                button
                dense
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, `mailbox-advanced-${mailboxId}`)}>
                <TuneIcon className={classes.scrollspyIcon} />
                Advanced
              </ListItem>
              <ListItem
                divider
                button
                dense
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, `mailbox-tools-${mailboxId}`)}>
                <BuildIcon className={classes.scrollspyIcon} />
                Tools
              </ListItem>
              {services.map((service, i, arr) => {
                return (
                  <ListItem
                    key={service.id}
                    divider={i !== (arr.length - 1)}
                    button
                    dense
                    className={classes.scrollspyItem}
                    onClick={(evt) => this.scrollToSection(evt, `service-section-${service.id}`)}>
                    <ServiceAvatar size={24} serviceId={service.id} className={classes.scrollspyServiceIcon} />
                    <ListItemText
                      className={classes.scrollspyTextContainer}
                      classes={{
                        primary: classes.scrollspyText,
                        secondary: classes.scrollspyText
                      }}
                      primary={service.humanizedType}
                      secondary={service.humanizedType !== serviceDisplayNames[i] ? serviceDisplayNames[i] : undefined} />
                  </ListItem>
                )
              })}
            </Scrollspy>
          </List>
        </Paper>
      </div>
    )
  }
}

export default AccountSettingsScroller
