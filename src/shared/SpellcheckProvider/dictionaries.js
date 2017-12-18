/**
Full list of character sets thanks to apple
https://opensource.apple.com/source/WebCore/WebCore-7601.3.8/platform/text/LocaleToScriptMappingDefault.cpp
static const LocaleScript localeScriptList[] = {
    { "aa", USCRIPT_LATIN },
    { "ab", USCRIPT_CYRILLIC },
    { "ady", USCRIPT_CYRILLIC },
    { "af", USCRIPT_LATIN },
    { "ak", USCRIPT_LATIN },
    { "am", USCRIPT_ETHIOPIC },
    { "ar", USCRIPT_ARABIC },
    { "as", USCRIPT_BENGALI },
    { "ast", USCRIPT_LATIN },
    { "av", USCRIPT_CYRILLIC },
    { "ay", USCRIPT_LATIN },
    { "az", USCRIPT_LATIN },
    { "ba", USCRIPT_CYRILLIC },
    { "be", USCRIPT_CYRILLIC },
    { "bg", USCRIPT_CYRILLIC },
    { "bi", USCRIPT_LATIN },
    { "bn", USCRIPT_BENGALI },
    { "bo", USCRIPT_TIBETAN },
    { "bs", USCRIPT_LATIN },
    { "ca", USCRIPT_LATIN },
    { "ce", USCRIPT_CYRILLIC },
    { "ceb", USCRIPT_LATIN },
    { "ch", USCRIPT_LATIN },
    { "chk", USCRIPT_LATIN },
    { "cs", USCRIPT_LATIN },
    { "cy", USCRIPT_LATIN },
    { "da", USCRIPT_LATIN },
    { "de", USCRIPT_LATIN },
    { "dv", USCRIPT_THAANA },
    { "dz", USCRIPT_TIBETAN },
    { "ee", USCRIPT_LATIN },
    { "efi", USCRIPT_LATIN },
    { "el", USCRIPT_GREEK },
    { "en", USCRIPT_LATIN },
    { "es", USCRIPT_LATIN },
    { "et", USCRIPT_LATIN },
    { "eu", USCRIPT_LATIN },
    { "fa", USCRIPT_ARABIC },
    { "fi", USCRIPT_LATIN },
    { "fil", USCRIPT_LATIN },
    { "fj", USCRIPT_LATIN },
    { "fo", USCRIPT_LATIN },
    { "fr", USCRIPT_LATIN },
    { "fur", USCRIPT_LATIN },
    { "fy", USCRIPT_LATIN },
    { "ga", USCRIPT_LATIN },
    { "gaa", USCRIPT_LATIN },
    { "gd", USCRIPT_LATIN },
    { "gil", USCRIPT_LATIN },
    { "gl", USCRIPT_LATIN },
    { "gn", USCRIPT_LATIN },
    { "gsw", USCRIPT_LATIN },
    { "gu", USCRIPT_GUJARATI },
    { "ha", USCRIPT_LATIN },
    { "haw", USCRIPT_LATIN },
    { "he", USCRIPT_HEBREW },
    { "hi", USCRIPT_DEVANAGARI },
    { "hil", USCRIPT_LATIN },
    { "ho", USCRIPT_LATIN },
    { "hr", USCRIPT_LATIN },
    { "ht", USCRIPT_LATIN },
    { "hu", USCRIPT_LATIN },
    { "hy", USCRIPT_ARMENIAN },
    { "id", USCRIPT_LATIN },
    { "ig", USCRIPT_LATIN },
    { "ii", USCRIPT_YI },
    { "ilo", USCRIPT_LATIN },
    { "inh", USCRIPT_CYRILLIC },
    { "is", USCRIPT_LATIN },
    { "it", USCRIPT_LATIN },
    { "iu", USCRIPT_CANADIAN_ABORIGINAL },
    { "ja", USCRIPT_KATAKANA_OR_HIRAGANA },
    { "jv", USCRIPT_LATIN },
    { "ka", USCRIPT_GEORGIAN },
    { "kaj", USCRIPT_LATIN },
    { "kam", USCRIPT_LATIN },
    { "kbd", USCRIPT_CYRILLIC },
    { "kha", USCRIPT_LATIN },
    { "kk", USCRIPT_CYRILLIC },
    { "kl", USCRIPT_LATIN },
    { "km", USCRIPT_KHMER },
    { "kn", USCRIPT_KANNADA },
    { "ko", USCRIPT_HANGUL },
    { "kok", USCRIPT_DEVANAGARI },
    { "kos", USCRIPT_LATIN },
    { "kpe", USCRIPT_LATIN },
    { "krc", USCRIPT_CYRILLIC },
    { "ks", USCRIPT_ARABIC },
    { "ku", USCRIPT_ARABIC },
    { "kum", USCRIPT_CYRILLIC },
    { "ky", USCRIPT_CYRILLIC },
    { "la", USCRIPT_LATIN },
    { "lah", USCRIPT_ARABIC },
    { "lb", USCRIPT_LATIN },
    { "lez", USCRIPT_CYRILLIC },
    { "ln", USCRIPT_LATIN },
    { "lo", USCRIPT_LAO },
    { "lt", USCRIPT_LATIN },
    { "lv", USCRIPT_LATIN },
    { "mai", USCRIPT_DEVANAGARI },
    { "mdf", USCRIPT_CYRILLIC },
    { "mg", USCRIPT_LATIN },
    { "mh", USCRIPT_LATIN },
    { "mi", USCRIPT_LATIN },
    { "mk", USCRIPT_CYRILLIC },
    { "ml", USCRIPT_MALAYALAM },
    { "mn", USCRIPT_CYRILLIC },
    { "mr", USCRIPT_DEVANAGARI },
    { "ms", USCRIPT_LATIN },
    { "mt", USCRIPT_LATIN },
    { "my", USCRIPT_MYANMAR },
    { "myv", USCRIPT_CYRILLIC },
    { "na", USCRIPT_LATIN },
    { "nb", USCRIPT_LATIN },
    { "ne", USCRIPT_DEVANAGARI },
    { "niu", USCRIPT_LATIN },
    { "nl", USCRIPT_LATIN },
    { "nn", USCRIPT_LATIN },
    { "nr", USCRIPT_LATIN },
    { "nso", USCRIPT_LATIN },
    { "ny", USCRIPT_LATIN },
    { "oc", USCRIPT_LATIN },
    { "om", USCRIPT_LATIN },
    { "or", USCRIPT_ORIYA },
    { "os", USCRIPT_CYRILLIC },
    { "pa", USCRIPT_GURMUKHI },
    { "pag", USCRIPT_LATIN },
    { "pap", USCRIPT_LATIN },
    { "pau", USCRIPT_LATIN },
    { "pl", USCRIPT_LATIN },
    { "pon", USCRIPT_LATIN },
    { "ps", USCRIPT_ARABIC },
    { "pt", USCRIPT_LATIN },
    { "qu", USCRIPT_LATIN },
    { "rm", USCRIPT_LATIN },
    { "rn", USCRIPT_LATIN },
    { "ro", USCRIPT_LATIN },
    { "ru", USCRIPT_CYRILLIC },
    { "rw", USCRIPT_LATIN },
    { "sa", USCRIPT_DEVANAGARI },
    { "sah", USCRIPT_CYRILLIC },
    { "sat", USCRIPT_LATIN },
    { "sd", USCRIPT_ARABIC },
    { "se", USCRIPT_LATIN },
    { "sg", USCRIPT_LATIN },
    { "si", USCRIPT_SINHALA },
    { "sid", USCRIPT_LATIN },
    { "sk", USCRIPT_LATIN },
    { "sl", USCRIPT_LATIN },
    { "sm", USCRIPT_LATIN },
    { "so", USCRIPT_LATIN },
    { "sq", USCRIPT_LATIN },
    { "sr", USCRIPT_CYRILLIC },
    { "ss", USCRIPT_LATIN },
    { "st", USCRIPT_LATIN },
    { "su", USCRIPT_LATIN },
    { "sv", USCRIPT_LATIN },
    { "sw", USCRIPT_LATIN },
    { "ta", USCRIPT_TAMIL },
    { "te", USCRIPT_TELUGU },
    { "tet", USCRIPT_LATIN },
    { "tg", USCRIPT_CYRILLIC },
    { "th", USCRIPT_THAI },
    { "ti", USCRIPT_ETHIOPIC },
    { "tig", USCRIPT_ETHIOPIC },
    { "tk", USCRIPT_LATIN },
    { "tkl", USCRIPT_LATIN },
    { "tl", USCRIPT_LATIN },
    { "tn", USCRIPT_LATIN },
    { "to", USCRIPT_LATIN },
    { "tpi", USCRIPT_LATIN },
    { "tr", USCRIPT_LATIN },
    { "trv", USCRIPT_LATIN },
    { "ts", USCRIPT_LATIN },
    { "tt", USCRIPT_CYRILLIC },
    { "tvl", USCRIPT_LATIN },
    { "tw", USCRIPT_LATIN },
    { "ty", USCRIPT_LATIN },
    { "tyv", USCRIPT_CYRILLIC },
    { "udm", USCRIPT_CYRILLIC },
    { "ug", USCRIPT_ARABIC },
    { "uk", USCRIPT_CYRILLIC },
    { "und", USCRIPT_LATIN },
    { "ur", USCRIPT_ARABIC },
    { "uz", USCRIPT_CYRILLIC },
    { "ve", USCRIPT_LATIN },
    { "vi", USCRIPT_LATIN },
    { "wal", USCRIPT_ETHIOPIC },
    { "war", USCRIPT_LATIN },
    { "wo", USCRIPT_LATIN },
    { "xh", USCRIPT_LATIN },
    { "yap", USCRIPT_LATIN },
    { "yo", USCRIPT_LATIN },
    { "za", USCRIPT_LATIN },
    { "zh", USCRIPT_SIMPLIFIED_HAN },
    { "zh_hk", USCRIPT_TRADITIONAL_HAN },
    { "zh_tw", USCRIPT_TRADITIONAL_HAN },
    { "zu", USCRIPT_LATIN }
};
*/

module.exports = {
  'af_ZA': {
    license: 'https://waveboxio.com/dl/dictionaries/af_ZA/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/af_ZA/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/af_ZA/index.dic',
    name: 'Afrikaans - Afrikaans',
    charset: 'USCRIPT_LATIN'
  },
  'ak_GH': {
    license: 'https://waveboxio.com/dl/dictionaries/ak_GH/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ak_GH/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ak_GH/index.dic',
    name: 'Akana - Akan',
    charset: 'USCRIPT_LATIN'
  },
  'am_ET': {
    license: 'https://waveboxio.com/dl/dictionaries/am_ET/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/am_ET/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/am_ET/index.dic',
    name: 'አማርኛ - Amharic',
    charset: 'USCRIPT_ETHIOPIC'
  },
  'an_ES': {
    license: 'https://waveboxio.com/dl/dictionaries/an_ES/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/an_ES/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/an_ES/index.dic',
    name: 'Aragonés - Aragonese',
    charset: 'USCRIPT_LATIN'
  },
  'az_AZ-latin': {
    license: 'https://waveboxio.com/dl/dictionaries/az_AZ-latin/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/az_AZ-latin/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/az_AZ-latin/index.dic',
    name: 'Azərbaycanca / آذربايجان - Azerbaijani',
    charset: 'USCRIPT_LATIN'
  },
  'be_BY': {
    license: 'https://waveboxio.com/dl/dictionaries/be_BY/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/be_BY/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/be_BY/index.dic',
    name: 'Беларуская : Belarusian',
    charset: 'USCRIPT_CYRILLIC'
  },
  'bg_BG': {
    license: 'https://waveboxio.com/dl/dictionaries/bg_BG/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/bg_BG/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/bg_BG/index.dic',
    name: 'Български - Bulgarian',
    charset: 'USCRIPT_CYRILLIC'
  },
  'br_FR': {
    license: 'https://waveboxio.com/dl/dictionaries/br_FR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/br_FR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/br_FR/index.dic',
    name: 'Brezhoneg : Breton',
    charset: 'USCRIPT_LATIN'
  },
  'ca_ES-valencia': {
    license: 'https://waveboxio.com/dl/dictionaries/ca_ES-valencia/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ca_ES-valencia/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ca_ES-valencia/index.dic',
    name: 'Català (València) - Catalan (Valencia)',
    charset: 'USCRIPT_LATIN'
  },
  'ca_ES': {
    license: 'https://waveboxio.com/dl/dictionaries/ca_ES/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ca_ES/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ca_ES/index.dic',
    name: 'Català - Catalan',
    charset: 'USCRIPT_LATIN'
  },
  'cs_CZ': {
    license: 'https://waveboxio.com/dl/dictionaries/cs_CZ/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/cs_CZ/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/cs_CZ/index.dic',
    name: 'Česky - Czech',
    charset: 'USCRIPT_LATIN'
  },
  'cy_GB': {
    license: 'https://waveboxio.com/dl/dictionaries/cy_GB/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/cy_GB/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/cy_GB/index.dic',
    name: 'Cymraeg - Welsh',
    charset: 'USCRIPT_LATIN'
  },
  'da_DK': {
    license: 'https://waveboxio.com/dl/dictionaries/da_DK/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/da_DK/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/da_DK/index.dic',
    name: 'Dansk - Danish',
    charset: 'USCRIPT_LATIN'
  },
  'de_AT': {
    license: 'https://waveboxio.com/dl/dictionaries/de_AT/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/de_AT/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/de_AT/index.dic',
    name: 'Deutsch (Österreich) - German (Austria)',
    charset: 'USCRIPT_LATIN'
  },
  'de_CH': {
    license: 'https://waveboxio.com/dl/dictionaries/de_CH/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/de_CH/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/de_CH/index.dic',
    name: 'Deutsch (Schweiz) - German (Switzerland)',
    charset: 'USCRIPT_LATIN'
  },
  'de_DE': {
    license: 'https://waveboxio.com/dl/dictionaries/de_DE/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/de_DE/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/de_DE/index.dic',
    name: 'Deutsch - German',
    charset: 'USCRIPT_LATIN'
  },
  'el_GR': {
    license: 'https://waveboxio.com/dl/dictionaries/el_GR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/el_GR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/el_GR/index.dic',
    name: 'Ελληνικά - Greek',
    charset: 'USCRIPT_GREEK'
  },
  'en_AU': {
    license: 'https://waveboxio.com/dl/dictionaries/en_AU/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/en_AU/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/en_AU/index.dic',
    name: 'English (Australia) - English (Australia)',
    charset: 'USCRIPT_LATIN'
  },
  'en_CA': {
    license: 'https://waveboxio.com/dl/dictionaries/en_CA/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/en_CA/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/en_CA/index.dic',
    name: 'English (Canada) - English (Canada)',
    charset: 'USCRIPT_LATIN'
  },
  'en_GB': {
    license: 'https://waveboxio.com/dl/dictionaries/en_GB/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/en_GB/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/en_GB/index.dic',
    name: 'English (UK) - English (UK)',
    charset: 'USCRIPT_LATIN'
  },
  'en_US': {
    license: 'https://waveboxio.com/dl/dictionaries/en_US/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/en_US/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/en_US/index.dic',
    name: 'English (US) - English (US)',
    charset: 'USCRIPT_LATIN'
  },
  'en_ZA': {
    license: 'https://waveboxio.com/dl/dictionaries/en_ZA/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/en_ZA/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/en_ZA/index.dic',
    name: 'English (South Africa) - English (South Africa)',
    charset: 'USCRIPT_LATIN'
  },
  'es_AR': {
    license: 'https://waveboxio.com/dl/dictionaries/es_AR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_AR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_AR/index.dic',
    name: 'Español (Argentina) - Spanish (Argentina)',
    charset: 'USCRIPT_LATIN'
  },
  'es_BO': {
    license: 'https://waveboxio.com/dl/dictionaries/es_BO/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_BO/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_BO/index.dic',
    name: 'Español (Bolivia) - Spanish (Bolivia)',
    charset: 'USCRIPT_LATIN'
  },
  'es_CL': {
    license: 'https://waveboxio.com/dl/dictionaries/es_CL/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_CL/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_CL/index.dic',
    name: 'Español (Chile) - Spanish (Chile)',
    charset: 'USCRIPT_LATIN'
  },
  'es_CO': {
    license: 'https://waveboxio.com/dl/dictionaries/es_CO/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_CO/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_CO/index.dic',
    name: 'Español (Colombia) - Spanish (Colombia)',
    charset: 'USCRIPT_LATIN'
  },
  'es_CR': {
    license: 'https://waveboxio.com/dl/dictionaries/es_CR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_CR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_CR/index.dic',
    name: 'Español (Costa Rica) - Spanish (Costa Rica)',
    charset: 'USCRIPT_LATIN'
  },
  'es_CU': {
    license: 'https://waveboxio.com/dl/dictionaries/es_CU/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_CU/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_CU/index.dic',
    name: 'Español (Cuba) - Spanish (Cuba)',
    charset: 'USCRIPT_LATIN'
  },
  'es_DO': {
    license: 'https://waveboxio.com/dl/dictionaries/es_DO/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_DO/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_DO/index.dic',
    name: 'Español (República Dominicana) - Spanish (Dominican Republic)',
    charset: 'USCRIPT_LATIN'
  },
  'es_EC': {
    license: 'https://waveboxio.com/dl/dictionaries/es_EC/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_EC/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_EC/index.dic',
    name: 'Español (Ecuador) - Spanish (Ecuador)',
    charset: 'USCRIPT_LATIN'
  },
  'es_ES': {
    license: 'https://waveboxio.com/dl/dictionaries/es_ES/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_ES/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_ES/index.dic',
    name: 'Español (España) - Spanish (Spain)',
    charset: 'USCRIPT_LATIN'
  },
  'es_GT': {
    license: 'https://waveboxio.com/dl/dictionaries/es_GT/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_GT/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_GT/index.dic',
    name: 'Español (Guatemala) - Spanish (Guatemala)',
    charset: 'USCRIPT_LATIN'
  },
  'es_HN': {
    license: 'https://waveboxio.com/dl/dictionaries/es_HN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_HN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_HN/index.dic',
    name: 'Español (Honduras) - Spanish (Honduras)',
    charset: 'USCRIPT_LATIN'
  },
  'es_MX': {
    license: 'https://waveboxio.com/dl/dictionaries/es_MX/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_MX/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_MX/index.dic',
    name: 'Español (Méjico) - Spanish (Mexico)',
    charset: 'USCRIPT_LATIN'
  },
  'es_NI': {
    license: 'https://waveboxio.com/dl/dictionaries/es_NI/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_NI/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_NI/index.dic',
    name: 'Español (Nicaragua) - Spanish (Nicaragua)',
    charset: 'USCRIPT_LATIN'
  },
  'es_PA': {
    license: 'https://waveboxio.com/dl/dictionaries/es_PA/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_PA/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_PA/index.dic',
    name: 'Español (Panamá) - Spanish (Panama)',
    charset: 'USCRIPT_LATIN'
  },
  'es_PE': {
    license: 'https://waveboxio.com/dl/dictionaries/es_PE/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_PE/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_PE/index.dic',
    name: 'Español (Perú) - Spanish (Peru)',
    charset: 'USCRIPT_LATIN'
  },
  'es_PR': {
    license: 'https://waveboxio.com/dl/dictionaries/es_PR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_PR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_PR/index.dic',
    name: 'Español (Puerto Rico) - Spanish (Puerto Rico)',
    charset: 'USCRIPT_LATIN'
  },
  'es_PY': {
    license: 'https://waveboxio.com/dl/dictionaries/es_PY/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_PY/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_PY/index.dic',
    name: 'Español (Paraguay) - Spanish (Paraguay)',
    charset: 'USCRIPT_LATIN'
  },
  'es_SV': {
    license: 'https://waveboxio.com/dl/dictionaries/es_SV/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_SV/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_SV/index.dic',
    name: 'Español (El Salvador) - Spanish (El Salvador)',
    charset: 'USCRIPT_LATIN'
  },
  'es_UY': {
    license: 'https://waveboxio.com/dl/dictionaries/es_UY/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_UY/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_UY/index.dic',
    name: 'Español (Uruguay) - Spanish (Uruguay)',
    charset: 'USCRIPT_LATIN'
  },
  'es_VE': {
    license: 'https://waveboxio.com/dl/dictionaries/es_VE/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/es_VE/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/es_VE/index.dic',
    name: 'Español (Venezuela) - Spanish (Venezuela)',
    charset: 'USCRIPT_LATIN'
  },
  'et_EE': {
    license: 'https://waveboxio.com/dl/dictionaries/et_EE/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/et_EE/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/et_EE/index.dic',
    name: 'Eesti - Estonian',
    charset: 'USCRIPT_LATIN'
  },
  'eu_ES': {
    license: 'https://waveboxio.com/dl/dictionaries/eu_ES/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/eu_ES/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/eu_ES/index.dic',
    name: 'Euskara - Basque',
    charset: 'USCRIPT_LATIN'
  },
  'fr_FR': {
    license: 'https://waveboxio.com/dl/dictionaries/fr_FR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/fr_FR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/fr_FR/index.dic',
    name: 'Français - French',
    charset: 'USCRIPT_LATIN'
  },
  'ga_IE': {
    license: 'https://waveboxio.com/dl/dictionaries/ga_IE/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ga_IE/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ga_IE/index.dic',
    name: 'Gaeilge - Irish',
    charset: 'USCRIPT_LATIN'
  },
  'gd_GB': {
    license: 'https://waveboxio.com/dl/dictionaries/gd_GB/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/gd_GB/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/gd_GB/index.dic',
    name: 'Gàidhlig - Scottish Gaelic',
    charset: 'USCRIPT_LATIN'
  },
  'gl_ES': {
    license: 'https://waveboxio.com/dl/dictionaries/gl_ES/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/gl_ES/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/gl_ES/index.dic',
    name: 'Galego - Galician',
    charset: 'USCRIPT_LATIN'
  },
  'gu_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/gu_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/gu_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/gu_IN/index.dic',
    name: 'ગુજરાતી - Gujarati',
    charset: 'USCRIPT_GUJARATI'
  },
  'he_IL': {
    license: 'https://waveboxio.com/dl/dictionaries/he_IL/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/he_IL/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/he_IL/index.dic',
    name: 'עברית - Hebrew',
    charset: 'USCRIPT_HEBREW'
  },
  'hi_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/hi_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/hi_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/hi_IN/index.dic',
    name: 'हिन्दी - Hindi',
    charset: 'USCRIPT_DEVANAGARI'
  },
  'hr_HR': {
    license: 'https://waveboxio.com/dl/dictionaries/hr_HR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/hr_HR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/hr_HR/index.dic',
    name: 'Hrvatski - Croatian',
    charset: 'USCRIPT_LATIN'
  },
  'hu_HU': {
    license: 'https://waveboxio.com/dl/dictionaries/hu_HU/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/hu_HU/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/hu_HU/index.dic',
    name: 'Magyar - Hungarian',
    charset: 'USCRIPT_LATIN'
  },
  'hy_AM': {
    license: 'https://waveboxio.com/dl/dictionaries/hy_AM/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/hy_AM/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/hy_AM/index.dic',
    name: 'Հայերեն - Armenian',
    charset: 'USCRIPT_ARMENIAN'
  },
  'id_ID': {
    license: 'https://waveboxio.com/dl/dictionaries/id_ID/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/id_ID/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/id_ID/index.dic',
    name: 'Bahasa Indonesia - Indonesian',
    charset: 'USCRIPT_LATIN'
  },
  'is': {
    license: 'https://waveboxio.com/dl/dictionaries/is/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/is/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/is/index.dic',
    name: 'Íslenska - Icelandic',
    charset: 'USCRIPT_LATIN'
  },
  'it_IT': {
    license: 'https://waveboxio.com/dl/dictionaries/it_IT/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/it_IT/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/it_IT/index.dic',
    name: 'Italiano - Italian',
    charset: 'USCRIPT_LATIN'
  },
  'kk': {
    license: 'https://waveboxio.com/dl/dictionaries/kk/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/kk/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/kk/index.dic',
    name: 'Қазақша - Kazakh',
    charset: 'USCRIPT_CYRILLIC'
  },
  'kn_ID': {
    license: 'https://waveboxio.com/dl/dictionaries/kn_ID/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/kn_ID/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/kn_ID/index.dic',
    name: 'ಕನ್ನಡ - Kannada',
    charset: 'USCRIPT_KANNADA'
  },
  'ko': {
    license: 'https://waveboxio.com/dl/dictionaries/ko/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ko/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ko/index.dic',
    name: '한국어 - Korean',
    charset: 'USCRIPT_HANGUL'
  },
  'ku_TR': {
    license: 'https://waveboxio.com/dl/dictionaries/ku_TR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ku_TR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ku_TR/index.dic',
    name: 'Kurdî / كوردی - Kurdish',
    charset: 'USCRIPT_ARABIC'
  },
  'lb_LU': {
    license: 'https://waveboxio.com/dl/dictionaries/lb_LU/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/lb_LU/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/lb_LU/index.dic',
    name: 'Lëtzebuergesch - Luxembourgish',
    charset: 'USCRIPT_LATIN'
  },
  'ln_CD': {
    license: 'https://waveboxio.com/dl/dictionaries/ln_CD/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ln_CD/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ln_CD/index.dic',
    name: 'Lingála - Lingala',
    charset: 'USCRIPT_LATIN'
  },
  'lt_LT': {
    license: 'https://waveboxio.com/dl/dictionaries/lt_LT/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/lt_LT/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/lt_LT/index.dic',
    name: 'Lietuvos - Lithuanian',
    charset: 'USCRIPT_LATIN'
  },
  'lv_LV': {
    license: 'https://waveboxio.com/dl/dictionaries/lv_LV/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/lv_LV/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/lv_LV/index.dic',
    name: 'Latvijas - Latvian',
    charset: 'USCRIPT_LATIN'
  },
  'mn_MN': {
    license: 'https://waveboxio.com/dl/dictionaries/mn_MN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/mn_MN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/mn_MN/index.dic',
    name: 'Монгол - Mongolian',
    charset: 'USCRIPT_CYRILLIC'
  },
  'mr_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/mr_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/mr_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/mr_IN/index.dic',
    name: 'मराठी - Marathi',
    charset: 'USCRIPT_DEVANAGARI'
  },
  'ms_MY': {
    license: 'https://waveboxio.com/dl/dictionaries/ms_MY/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ms_MY/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ms_MY/index.dic',
    name: 'Melayu - Malay',
    charset: 'USCRIPT_LATIN'
  },
  'nb_NO': {
    license: 'https://waveboxio.com/dl/dictionaries/nb_NO/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/nb_NO/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/nb_NO/index.dic',
    name: 'Norsk (bokmål) - Norwegian',
    charset: 'USCRIPT_LATIN'
  },
  'ne_NP': {
    license: 'https://waveboxio.com/dl/dictionaries/ne_NP/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ne_NP/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ne_NP/index.dic',
    name: 'नेपाली - Nepali',
    charset: 'USCRIPT_DEVANAGARI'
  },
  'nl_NL': {
    license: 'https://waveboxio.com/dl/dictionaries/nl_NL/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/nl_NL/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/nl_NL/index.dic',
    name: 'Nederlands - Dutch',
    charset: 'USCRIPT_LATIN'
  },
  'nn_NO': {
    license: 'https://waveboxio.com/dl/dictionaries/nn_NO/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/nn_NO/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/nn_NO/index.dic',
    name: 'Norsk (nynorsk) - Norwegian Nynorsk',
    charset: 'USCRIPT_LATIN'
  },
  'oc_FR': {
    license: 'https://waveboxio.com/dl/dictionaries/oc_FR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/oc_FR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/oc_FR/index.dic',
    name: 'Occitan - Occitan',
    charset: 'USCRIPT_LATIN'
  },
  'or_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/or_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/or_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/or_IN/index.dic',
    name: 'ଓଡ଼ିଆ - Oriya',
    charset: 'USCRIPT_ORIYA'
  },
  'pa_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/pa_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/pa_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/pa_IN/index.dic',
    name: 'ਪੰਜਾਬੀ / पंजाबी / پنجابي - Panjabi / Punjabi',
    charset: 'USCRIPT_GURMUKHI'
  },
  'pl_PL': {
    license: 'https://waveboxio.com/dl/dictionaries/pl_PL/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/pl_PL/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/pl_PL/index.dic',
    name: 'Polski - Polish',
    charset: 'USCRIPT_LATIN'
  },
  'pt_BR': {
    license: 'https://waveboxio.com/dl/dictionaries/pt_BR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/pt_BR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/pt_BR/index.dic',
    name: 'Português (Brasil) - Portuguese (Brazil)',
    charset: 'USCRIPT_LATIN'
  },
  'pt_PT': {
    license: 'https://waveboxio.com/dl/dictionaries/pt_PT/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/pt_PT/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/pt_PT/index.dic',
    name: 'Português (Portugal) - Portuguese (Portugal)',
    charset: 'USCRIPT_LATIN'
  },
  'ro_RO': {
    license: 'https://waveboxio.com/dl/dictionaries/ro_RO/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ro_RO/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ro_RO/index.dic',
    name: 'Română - Romanian',
    charset: 'USCRIPT_LATIN'
  },
  'ru_RU': {
    license: 'https://waveboxio.com/dl/dictionaries/ru_RU/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/ru_RU/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/ru_RU/index.dic',
    name: 'Русский - Russian',
    charset: 'USCRIPT_CYRILLIC'
  },
  'sa_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/sa_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sa_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sa_IN/index.dic',
    name: 'संस्कृतम् : Sanskrit',
    charset: 'USCRIPT_DEVANAGARI'
  },
  'sk_SK': {
    license: 'https://waveboxio.com/dl/dictionaries/sk_SK/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sk_SK/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sk_SK/index.dic',
    name: 'Slovenčina - Slovak',
    charset: 'USCRIPT_LATIN'
  },
  'sl_SI': {
    license: 'https://waveboxio.com/dl/dictionaries/sl_SI/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sl_SI/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sl_SI/index.dic',
    name: 'Slovenščina - Slovenian',
    charset: 'USCRIPT_LATIN'
  },
  'sq_AL': {
    license: 'https://waveboxio.com/dl/dictionaries/sq_AL/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sq_AL/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sq_AL/index.dic',
    name: 'Shqip : Albanian',
    charset: 'USCRIPT_LATIN'
  },
  'sr_RS-Latn': {
    license: 'https://waveboxio.com/dl/dictionaries/sr_RS-Latn/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sr_RS-Latn/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sr_RS-Latn/index.dic',
    name: 'Српски (латински) - Serbian (Latin)',
    charset: 'USCRIPT_LATIN'
  },
  'sr_RS': {
    license: 'https://waveboxio.com/dl/dictionaries/sr_RS/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sr_RS/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sr_RS/index.dic',
    name: 'Српски - Serbian',
    charset: 'USCRIPT_CYRILLIC'
  },
  'sv_SE': {
    license: 'https://waveboxio.com/dl/dictionaries/sv_SE/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/sv_SE/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/sv_SE/index.dic',
    name: 'Svenska - Swedish',
    charset: 'USCRIPT_LATIN'
  },
  'te_IN': {
    license: 'https://waveboxio.com/dl/dictionaries/te_IN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/te_IN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/te_IN/index.dic',
    name: 'తెలుగు : Telugu',
    charset: 'USCRIPT_TELUGU'
  },
  'tg': {
    license: 'https://waveboxio.com/dl/dictionaries/tg/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/tg/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/tg/index.dic',
    name: 'Тоҷикӣ : Tajik',
    charset: 'USCRIPT_CYRILLIC'
  },
  'tr_TR': {
    license: 'https://waveboxio.com/dl/dictionaries/tr-TR/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/tr-TR/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/tr-TR/index.dic',
    name: 'Türkçe - Turkish',
    charset: 'USCRIPT_LATIN'
  },
  'uk_UA': {
    license: 'https://waveboxio.com/dl/dictionaries/uk_UA/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/uk_UA/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/uk_UA/index.dic',
    name: 'Українська - Ukrainian',
    charset: 'USCRIPT_CYRILLIC'
  },
  'vi_VN': {
    license: 'https://waveboxio.com/dl/dictionaries/vi_VN/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/vi_VN/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/vi_VN/index.dic',
    name: 'Tiếng Việt - Vietnamese',
    charset: 'USCRIPT_LATIN'
  },
  'zu_ZA': {
    license: 'https://waveboxio.com/dl/dictionaries/zu_ZA/LICENSE.txt',
    aff: 'https://waveboxio.com/dl/dictionaries/zu_ZA/index.aff',
    dic: 'https://waveboxio.com/dl/dictionaries/zu_ZA/index.dic',
    name: 'isiZulu : Zulu',
    charset: 'USCRIPT_LATIN'
  }
}
