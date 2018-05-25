import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import { dictionariesStore, dictionariesActions } from 'stores/dictionaries'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
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
    return (
      modelCompare(this.props.language, nextProps.language, [
        'spellcheckerLanguage',
        'spellcheckerEnabled',
        'secondarySpellcheckerLanguage'
      ]) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
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
        <SettingsListItemSwitch
          label='Spellchecking'
          onChange={(evt, toggled) => settingsActions.sub.language.setEnableSpellchecker(toggled)}
          checked={language.spellcheckerEnabled} />
        <SettingsListItemSelectInline
          label='Spellchecking language'
          value={language.spellcheckerLanguage}
          disabled={!language.spellcheckerEnabled}
          options={installedDictionaries.map((info) => {
            return { value: info.lang, label: info.name }
          })}
          onChange={(evt, value) => settingsActions.sub.language.setSpellcheckerLanguage(value)} />
        <SettingsListItemSelectInline
          label='Secondary spellchecking language'
          value={language.secondarySpellcheckerLanguage !== null ? language.secondarySpellcheckerLanguage : '__none__'}
          disabled={!language.spellcheckerEnabled}
          options={[].concat(
            [{ value: '__none__', label: 'None' }],
            availableSecondary.map((info) => {
              return { value: info.lang, label: info.name }
            }),
            unavailbleSecondary.length === 0 ? [] : [
              { divider: true },
              {
                value: '__unavailableTitle__',
                label: 'Incompatible with primary language due to different character set',
                disabled: true,
                MenuItemProps: {
                  style: {
                    fontWeight: 'bold',
                    fontSize: '85%'
                  }
                }
              }
            ],
            unavailbleSecondary.map((info) => {
              return { value: info.lang, label: info.name, disabled: true }
            })
          )}
          onChange={(evt, value) => settingsActions.sub.language.setSecondarySpellcheckerLanguage(value !== '__none__' ? value : null)} />
        <SettingsListItemButton
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
