import { createContext, useContext } from 'react'

export const LangContext = createContext({
  lang: 'fi',
  t: (k) => k,
  setLang: () => {}
})

export function useLang() {
  return useContext(LangContext)
}
