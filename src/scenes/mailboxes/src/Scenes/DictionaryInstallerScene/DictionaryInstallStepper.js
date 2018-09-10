import React from 'react'
import dictionariesStore from 'stores/dictionaries/dictionariesStore'
import dictionariesActions from 'stores/dictionaries/dictionariesActions'
import electron from 'electron'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import { Stepper, Step, StepLabel, StepContent, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import lightBlue from '@material-ui/core/colors/lightBlue'

const STEPS = {
  PICK: 0,
  LICENSE: 1,
  DOWNLOAD: 2,
  FINISH: 3
}

const styles = {
  root: {
    width: 500
  },
  button: {
    margin: 8
  },
  spinner: {
    marginLeft: 16
  }
}

@withStyles(styles)
class DictionaryInstallStepper extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    dictionariesStore.listen(this.dictionariesChanged)
  }

  componentWillUnmount () {
    dictionariesStore.unlisten(this.dictionariesChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = this.generateInitialState(this.props)

  /**
  * Generates the state for the given props
  * @param props: the props to generate state for
  * @return state object
  */
  generateInitialState (props) {
    const store = dictionariesStore.getState()
    return {
      stepIndex: STEPS.PICK,
      installLanguage: store.installLanguage(),
      installLanguageInfo: null,
      installId: store.installId(),
      installInflight: store.installInflight(),
      uninstallDictionaries: store.sortedUninstalledDictionaryInfos()
    }
  }

  dictionariesChanged = (store) => {
    if (store.installId() !== this.state.installId) {
      this.setState(this.generateInitialState(this.props))
    } else {
      if (!this.state.installLanguage && store.installLanguage()) {
        this.setState({
          installLanguage: store.installLanguage(),
          installLanguageInfo: store.getDictionaryInfo(store.installLanguage()),
          stepIndex: STEPS.LICENSE
        })
      } else if (!this.state.installInflight && store.installInflight()) {
        this.setState({
          installInflight: store.installInflight(),
          stepIndex: STEPS.DOWNLOAD
        })
      } else if (this.state.installInflight && !store.installInflight()) {
        this.setState({
          installInflight: store.installInflight(),
          stepIndex: STEPS.FINISH
        })
      }
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Progress the user when they pick their language
  */
  handlePickLanguage = (evt) => {
    if (evt.target.value !== null && evt.target.value !== 'null') {
      dictionariesActions.pickDictionaryInstallLanguage(this.state.installId, evt.target.value)
    }
  }

  /**
  * Handles the user agreeing to the license
  */
  handleAgreeLicense = () => {
    dictionariesActions.installDictionary(this.state.installId)
  }

  /**
  * Handles cancelling the install
  */
  handleCancel = () => {
    window.location.hash = '/'
    dictionariesActions.stopDictionaryInstall()
  }

  /**
  * Handles completing the install
  */
  handleComplete = () => {
    window.location.hash = '/'
    dictionariesActions.completeDictionaryInstall()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props
    const { stepIndex, installLanguageInfo, uninstallDictionaries } = this.state

    return (
      <Stepper className={classes.root} activeStep={stepIndex} orientation='vertical'>
        <Step>
          <StepLabel>Pick Language</StepLabel>
          <StepContent>
            <FormControl fullWidth>
              <InputLabel>Pick the dictionary to install</InputLabel>
              <Select
                MenuProps={{ disableEnforceFocus: true }}
                value='null'
                onChange={this.handlePickLanguage}>
                {['null'].concat(uninstallDictionaries).map((info) => {
                  if (info === 'null') {
                    return (<MenuItem key='null' value={'null'} />)
                  } else {
                    return (<MenuItem key={info.lang} value={info.lang}>{info.name}</MenuItem>)
                  }
                })}
              </Select>
            </FormControl>
            <Button className={classes.button} onClick={this.handleCancel}>
              Cancel
            </Button>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Licensing</StepLabel>
          <StepContent>
            <p>
              <span>Check you're happy with the </span>
              <a href={(installLanguageInfo || {}).license} onClick={(evt) => { evt.preventDefault(); electron.remote.shell.openExternal(installLanguageInfo.license) }}>license</a>
              <span> of the <strong>{(installLanguageInfo || {}).name}</strong> dictionary</span>
            </p>
            <Button variant='raised' color='primary' className={classes.button} onClick={this.handleAgreeLicense}>
              Next
            </Button>
            <Button className={classes.button} onClick={this.handleCancel}>
              Cancel
            </Button>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Download</StepLabel>
          <StepContent>
            <p>Downloading <strong>{(installLanguageInfo || {}).name}</strong></p>
            <div className={classes.spinner}>
              <Spinner size={30} color={lightBlue[600]} speed={0.75} />
            </div>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Finish</StepLabel>
          <StepContent>
            <p>
              <span>The </span>
              <strong>{(installLanguageInfo || {}).name}</strong>
              <span> dictionary has been downloaded and installed.</span>
            </p>
            <Button variant='raised' color='primary' className={classes.button} onClick={this.handleComplete}>
              Done
            </Button>
          </StepContent>
        </Step>
      </Stepper>
    )
  }
}

export default DictionaryInstallStepper
