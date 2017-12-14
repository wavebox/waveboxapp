import React from 'react'
import dictionariesStore from 'stores/dictionaries/dictionariesStore'
import dictionariesActions from 'stores/dictionaries/dictionariesActions'
import {
  Stepper, Step, StepLabel, StepContent,
  RaisedButton, FlatButton,
  SelectField, MenuItem
} from 'material-ui'
import electron from 'electron'
import Spinner from 'sharedui/Components/Activity/Spinner'
import * as Colors from 'material-ui/styles/colors'

const STEPS = {
  PICK: 0,
  LICENSE: 1,
  DOWNLOAD: 2,
  FINISH: 3
}

export default class DictionaryInstallStepper extends React.Component {
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
  handlePickLanguage = (evt, index, value) => {
    if (value !== null) {
      dictionariesActions.pickDictionaryInstallLanguage(this.state.installId, value)
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
    dictionariesActions.stopDictionaryInstall()
  }

  /**
  * Handles completing the install
  */
  handleComplete = () => {
    dictionariesActions.completeDictionaryInstall()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { stepIndex, installLanguageInfo, uninstallDictionaries } = this.state

    return (
      <Stepper activeStep={stepIndex} orientation='vertical'>
        <Step>
          <StepLabel>Pick Language</StepLabel>
          <StepContent>
            <SelectField
              floatingLabelText='Pick the dictionary to install'
              fullWidth
              onChange={this.handlePickLanguage}>
              {[null].concat(uninstallDictionaries).map((info) => {
                if (info === null) {
                  return (<MenuItem key='null' value={null} primaryText='' />)
                } else {
                  return (<MenuItem key={info.lang} value={info.lang} primaryText={info.name} />)
                }
              })}
            </SelectField>
            <FlatButton
              label='Cancel'
              disableTouchRipple
              disableFocusRipple
              onClick={this.handleCancel} />
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
            <RaisedButton
              label='Next'
              disableTouchRipple
              disableFocusRipple
              primary
              onClick={this.handleAgreeLicense}
              style={{marginRight: 12}} />
            <FlatButton
              label='Cancel'
              disableTouchRipple
              disableFocusRipple
              onClick={this.handleCancel} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Download</StepLabel>
          <StepContent>
            <p>Downloading <strong>{(installLanguageInfo || {}).name}</strong></p>
            <div style={{ paddingLeft: 16 }}>
              <Spinner size={30} color={Colors.lightBlue600} speed={0.75} />
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
            <RaisedButton
              label='Done'
              disableTouchRipple
              disableFocusRipple
              primary
              onClick={this.handleComplete} />
          </StepContent>
        </Step>
      </Stepper>
    )
  }
}
