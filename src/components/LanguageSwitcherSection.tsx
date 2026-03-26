'use client'

import { useT, useLang, LangToggle } from '@/lib/i18n'

export default function LanguageSwitcherSection() {
  const t = useT()
  const { lang } = useLang()

  return (
    <>
      <LangToggle />
      <h1>{t.landingHero}</h1>
      <button>{t.createAccount}</button>
    </>
  )
}