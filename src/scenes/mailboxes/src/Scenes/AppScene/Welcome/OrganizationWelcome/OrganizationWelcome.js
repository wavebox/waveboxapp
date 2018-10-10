import React from 'react'
import { Button } from '@material-ui/core'
import classNames from 'classnames'
import { userStore, userActions } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import WelcomePanel from '../Common/WelcomePanel'
import WelcomePanelGrid from '../Common/WelcomePanelGrid'
import WelcomePanelGridCell from '../Common/WelcomePanelGridCell'
import WelcomePanelGridVR from '../Common/WelcomePanelGridVR'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import StyleMixins from 'wbui/Styles/StyleMixins'

const styles = (theme) => ({
  // Layout
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: ThemeTools.getValue(theme, 'waveboxorg.welcome.backgroundColor')
  },
  logoAddAccountCell: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomePanel: {
    backgroundColor: ThemeTools.getValue(theme, 'waveboxorg.welcome.panel.backgroundColor'),
    color: ThemeTools.getValue(theme, 'waveboxorg.welcome.panel.color')
  },

  // Elements
  logo: {
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '100%',
    minHeight: 200
  },
  fullWidthButton: {
    width: '100%',
    margin: 6
  },
  welcomeTextHeading: {
    marginTop: 0,
    color: ThemeTools.getValue(theme, 'waveboxorg.welcome.panel.title.color')
  },
  welcomeTextSubheading: {
    marginBottom: 10,
    color: ThemeTools.getValue(theme, 'waveboxorg.welcome.panel.subtitle.color')
  },

  // Profiles
  profiles: {
    maxHeight: 300,
    paddingLeft: -12,
    paddingRight: -12,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  profileListItem: {
    width: '100%',
    padding: '6px 10px'
  },
  profileListItemButton: {
    width: '100%'
  },
  profilesNone: {
    textAlign: 'center'
  }
})

@withStyles(styles, { withTheme: true })
class OrganizationWelcome extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      ...this.deriveStateFromOws(userState.user.ows)
    }
  })()

  userChanged = (userState) => {
    this.setState(
      this.deriveStateFromOws(userState.user.ows)
    )
  }

  /**
  * Derives the state from the users ows
  * @param ows: the ows settings
  * @return a state update
  */
  deriveStateFromOws (ows) {
    return {
      logo: ows.logo,
      addAppButtonVisible: ows.addAppButtonVisible,
      addAppButtonVariant: ows.addAppButtonVariant,
      addAppButtonColor: ows.addAppButtonColor,
      addAppButtonText: ows.addAppButtonText,
      welcomeTextHeading: ows.welcomeTextHeading,
      welcomeTextSubheading: ows.welcomeTextSubheading,
      rawTheme: ows.theme,
      profiles: ows.profiles,
      profileButtonVariant: ows.profileButtonVariant,
      profileButtonColor: ows.profileButtonColor
    }
  }

  /* **************************************************************************/
  // UI Handlers
  /* **************************************************************************/

  handleOpenAddWizard = () => {
    window.location.hash = '/mailbox_wizard/add'
  }

  handleRestoreProfile = (profileId) => {
    userActions.restoreUserProfile(profileId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the account grid item
  * @param classes: the classes to use
  * @param state: the state to read from
  * @return jsx
  */
  renderGridLeft (classes, state) {
    const {
      welcomeTextHeading,
      welcomeTextSubheading,
      profiles,
      addAppButtonVariant,
      addAppButtonColor,
      addAppButtonVisible,
      addAppButtonText,
      profileButtonVariant,
      profileButtonColor
    } = state

    return (
      <WelcomePanelGridCell>
        <h1 className={classes.welcomeTextHeading}>
          {welcomeTextHeading}
        </h1>
        <p className={classes.welcomeTextSubheading}>
          {welcomeTextSubheading}
        </p>
        <div className={classes.profiles}>
          {profiles && profiles.length ? (
            profiles.map((profile) => {
              return (
                <div key={profile.id} className={classes.profileListItem}>
                  <Button
                    variant={profileButtonVariant}
                    size='large'
                    color={profileButtonColor}
                    className={classes.profileListItemButton}
                    onClick={() => this.handleRestoreProfile(profile.id)}>
                    {profile.name}
                  </Button>
                </div>
              )
            })
          ) : (
            <div className={classes.profilesNone}>
              <p>No profiles available</p>
              {!addAppButtonVisible ? (
                <Button
                  variant={addAppButtonVariant}
                  size='large'
                  color={addAppButtonColor}
                  className={classes.fullWidthButton}
                  onClick={this.handleOpenAddWizard} >
                  {addAppButtonText}
                </Button>
              ) : undefined}
            </div>
          )}
        </div>
      </WelcomePanelGridCell>
    )
  }

  /**
  * Renders the add grid item
  * @param classes: the classes to use
  * @param state: the state to read from
  * @return jsx
  */
  renderGridRight (classes, state) {
    const {
      logo,
      addAppButtonVisible,
      addAppButtonVariant,
      addAppButtonColor,
      addAppButtonText
    } = state

    return (
      <WelcomePanelGridCell className={classes.logoAddAccountCell}>
        {logo ? (
          <div className={classes.logo} style={{ backgroundImage: `url("${logo}")` }} />
        ) : undefined}
        {addAppButtonVisible ? (
          <Button
            variant={addAppButtonVariant}
            size='large'
            color={addAppButtonColor}
            className={classes.fullWidthButton}
            onClick={this.handleOpenAddWizard} >
            {addAppButtonText}
          </Button>
        ) : undefined}
      </WelcomePanelGridCell>
    )
  }

  render () {
    const {
      className,
      classes,
      ...passProps
    } = this.props
    const {
      rawTheme
    } = this.state

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        <WelcomePanel paperClassName={classes.welcomePanel}>
          <WelcomePanelGrid>
            {this.renderGridLeft(classes, this.state)}
            {<WelcomePanelGridVR
              color={ThemeTools.getValue(rawTheme, 'waveboxorg.welcome.panel.color')}
              backgroundColor={ThemeTools.getValue(rawTheme, 'waveboxorg.welcome.panel.backgroundColor')} />}
            {this.renderGridRight(classes, this.state)}
          </WelcomePanelGrid>
        </WelcomePanel>
      </div>
    )
  }
}

export default OrganizationWelcome
