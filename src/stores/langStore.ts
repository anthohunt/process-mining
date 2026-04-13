import { create } from 'zustand'
import i18n from '../i18n'

interface LangState {
  lang: 'fr' | 'en'
  setLang: (lang: 'fr' | 'en') => void
  toggle: () => void
}

export const useLangStore = create<LangState>((set, get) => ({
  lang: 'fr',
  setLang: (lang) => {
    set({ lang })
    i18n.changeLanguage(lang)
  },
  toggle: () => {
    const next = get().lang === 'fr' ? 'en' : 'fr'
    get().setLang(next)
  },
}))
