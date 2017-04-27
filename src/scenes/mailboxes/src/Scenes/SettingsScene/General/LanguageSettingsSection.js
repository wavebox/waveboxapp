import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, RaisedButton, FontIcon, Divider } from 'material-ui'
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

    const { availableSecondary, unavailbleSecondary } = installedDictionaries.reduce((acc, info) => {
      if (primaryDictionaryInfo.charset === info.charset) {
        acc.availableSecondary.push(info)
      } else {
        acc.unavailbleSecondary.push(info)
      }
      return acc
    }, { availableSecondary: [], unavailbleSecondary: [] })

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
          {
            [].concat(
              [<MenuItem key='__none__' value='__none__' primaryText='None' />],
              availableSecondary.map((info) => {
                return (<MenuItem key={info.lang} value={info.lang} primaryText={info.name} />)
              }),
              unavailbleSecondary.length === 0 ? [] : [
                (<Divider key='__unavailable__' />),
                (<MenuItem
                  key='__unavailableTitle__'
                  value='__none__'
                  style={{
                    whiteSpace: 'normal',
                    fontWeight: 'bold',
                    lineHeight: '1.2em',
                    paddingTop: 5,
                    paddingBottom: 5
                  }}
                  primaryText='These languages are not compatible with the primary language as they use a different character set'
                  disabled />)
              ],
              unavailbleSecondary.map((info) => {
                return (
                  <MenuItem
                    key={info.lang}
                    value={info.lang}
                    primaryText={info.name}
                    disabled />)
              }),
            )
          }
        </SelectField>
        <RaisedButton
          label='Install more Dictionaries'
          icon={<FontIcon className='material-icons'>language</FontIcon>}
          onTouchTap={() => { dictionariesActions.startDictionaryInstall() }} />
      </Paper>
    )
  }
}
