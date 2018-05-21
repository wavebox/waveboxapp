import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import { dictionariesStore, dictionariesActions } from 'stores/dictionaries'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListSelect from 'wbui/SettingsListSelect'
import SettingsListButton from 'wbui/SettingsListButton'
import { withStyles } from '@material-ui/core/styles'
import LanguageIcon from '@material-ui/icons/Language'

const styles = {

}

@withStyles(styles)
class LanguageSettingsSection extends React.Component {
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
    const {language, showRestart, classes, ...passProps} = this.props
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
      <SettingsListSection title='Language' icon={<LanguageIcon />} {...passProps}>
        <SettingsListSwitch
          label='Spellchecking'
          onChange={(evt, toggled) => settingsActions.sub.language.setEnableSpellchecker(toggled)}
          checked={language.spellcheckerEnabled} />
        <SettingsListSelect
          label='Spellchecking language'
          value={language.spellcheckerLanguage}
          disabled={!language.spellcheckerEnabled}
          options={installedDictionaries.map((info) => {
            return { value: info.lang, label: info.name }
          })}
          onChange={(evt, value) => settingsActions.sub.language.setSpellcheckerLanguage(value)} />
        <SettingsListSelect
          label='Secondary spellchecking language'
          value={language.secondarySpellcheckerLanguage !== null ? language.secondarySpellcheckerLanguage : '__none__'}
          disabled={!language.spellcheckerEnabled}
          options={[].concat(
            [{ value: '__none__', label: 'None' }],
            availableSecondary.map((info) => {
              return { value: info.lang, label: info.name }
            }),
            unavailbleSecondary.length === 0 ? [] : [
              [{ divider: true }],
              {
                value: '__unavailableTitle__',
                label: 'These languages are not compatible with the primary language as they use a different character set',
                disabled: true
              }
            ],
            unavailbleSecondary.map((info) => {
              return { value: info.lang, label: info.name }
            })
          )}
          onChange={(evt, value) => settingsActions.sub.language.setSecondarySpellcheckerLanguage(value !== '__none__' ? value : null)} />
        <SettingsListButton
          divider={false}
          label='Install more Dictionaries'
          disabled={!language.spellcheckerEnabled}
          icon={<LanguageIcon />}
          onClick={() => {
            dictionariesActions.startDictionaryInstall()
          }} />
      </SettingsListSection>
    )
  }
}

export default LanguageSettingsSection
