import { useTranslation } from 'react-i18next'
import * as fr from './legalContent.fr'
import * as en from './legalContent.en'
import * as cn from './legalContent.cn'

const contentByLang = { fr, en, cn }

export function useLegalContent() {
  const { i18n } = useTranslation()
  const lang = i18n.language.split('-')[0]
  return contentByLang[lang] || contentByLang.fr
}
