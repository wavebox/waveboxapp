import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, RaisedButton, FontIcon } from 'material-ui'
import { settingsActions } from 'stores/settings'
import { dictionariesStore, dictionariesActions } from 'stores/dictionaries'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class LanguageSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    language: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

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

  state = (() => {
    return {
      installedDictionaries: dictionariesStore.getState().sortedInstalledDictionaryInfos()
    }
  })()

  dictionariesChanged = (dictionariesState) => {
    this.setState({
      installedDictionaries: dictionariesState.sortedInstalledDictionaryInfos()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {language, showRestart, ...passProps} = this.props
    const { installedDictionaries } = this.state
    const dictionaryState = dictionariesStore.getState()
    const primaryDictionaryInfo = dictionaryState.getDictionaryInfo(language.spellcheckerLanguage)

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Language</h1>
        <Toggle
          toggled={language.spellcheckerEnabled}
          labelPosition='right'
          label='Spell-checker (Requires Restart)'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.setEnableSpellchecker(toggled)
          }} />
        <SelectField
          floatingLabelText='Spell-checker language'
          value={language.spellcheckerLanguage}
          fullWidth
          onChange={(evt, index, value) => { settingsActions.setSpellcheckerLanguage(value) }}>
          {installedDictionaries.map((info) => {
            return (<MenuItem key={info.lang} value={info.lang} primaryText={info.name} />)
          })}
        </SelectField>
        <SelectField
          floatingLabelText='Secondary Spell-checker language'
          value={language.secondarySpellcheckerLanguage !== null ? language.secondarySpellcheckerLanguage : '__none__'}
          fullWidth
          onChange={(evt, index, value) => {
            settingsActions.setSecondarySpellcheckerLanguage(value !== '__none__' ? value : null)
          }}>
          {[undefined].concat(installedDictionaries).map((info) => {
            if (info === undefined) {
              return (<MenuItem key='__none__' value='__none__' primaryText='None' />)
            } else {
              const disabled = primaryDictionaryInfo.charset !== info.charset
              return (<MenuItem key={info.lang} value={info.lang} primaryText={info.name} disabled={disabled} />)
            }
          })}
        </SelectField>
        <RaisedButton
          label='Install more Dictionaries'
          icon={<FontIcon className='material-icons'>language</FontIcon>}
          onTouchTap={() => { dictionariesActions.startDictionaryInstall() }} />
      </Paper>
    )
  }
}
