'use client'
// src/lib/i18n.tsx
// Global language context for Vynk — EN (default) / ES
// Usage anywhere: import { useLang, useT, LangToggle } from '@/lib/i18n'

import {
  createContext, useContext, useState, useEffect,
  type ReactNode,
} from 'react'

/* ─── Types ─────────────────────────────────────────────────── */
export type Lang = 'en' | 'es'

/* ─── Full translation dictionary ───────────────────────────── */
export const TRANSLATIONS = {
  en: {
    // ── Nav / global
    backToVynk: 'Back to Vynk',
    viewCard: 'View card →',
    cardBuilder: 'Card Builder',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading…',
    processing: 'Processing…',
    apply: 'Apply',
    edit: 'Edit',
    delete: 'Delete',
    enable: 'Enable',
    disable: 'Disable',
    active: 'Active:',
    liveAt: 'Live at:',

    // ── Landing
    landingHero: 'Make every introduction',
    landingCta: 'Create my card — $20',
    landingSubCta: 'One-time · No subscription',
    landingNavCta: 'Get started — $20',
    landingBadge: 'Digital Identity Platform',
    landingHeroLine1: 'Make',
    landingHeroLine2: 'every',
    landingHeroLine3: 'introduction',
    landingHeroAccent: 'smart.',
    landingSubtext: 'Replace your paper card with a dynamic digital identity. One QR scan — your contact saved instantly on any phone.',
    howItWorksCta: 'How it works →',

    sectionIdentity: 'Identity Platform',
    sectionHowItWorks: 'How it works',
    sectionFeatures: 'Features',
    sectionPricing: 'Pricing',

    promo1: 'One scan · Contact saved forever',
    promo2: 'Front & back · Two-sided digital card',
    promo3: 'Works worldwide · Any phone, any browser',
    promo4: 'Free updates · Identity changes from $10',
    promo5: 'Your unique link · vynk.app/c/yourname',

    howBadge: 'How it works',
    howTitleLine1: 'Three steps.',
    howTitleLine2: 'One identity.',
    howSubtext: 'From setup to sharing in under 3 minutes.',
    step1Title: 'Build your card',
    step1Desc: 'Fill in your identity, upload photo or logo, pick templates, fonts and colors in real time. Everything previews instantly.',
    step2Title: 'Pay once, keep forever',
    step2Desc: 'A single $20 payment activates your card at your unique link and QR code. No subscriptions, no monthly fees, ever.',
    step3Title: 'Share anywhere',
    step3Desc: 'Anyone scans your QR or opens your link — your contact saves to their phone in one tap. Works globally on any device.',
    everythingIncludedCta: 'Everything included →',

    featuresBadge: 'Everything included',
    featuresTitleLine1: 'One card.',
    featuresTitleLine2: 'Infinite possibilities.',
    feature1Title: 'Save to Contacts',
    feature1Desc: 'QR scan → phone saves contact instantly. Name, photo, phone, email. Works on iPhone and Android worldwide.',
    feature2Title: 'Front & back card',
    feature2Desc: 'Two faces. Front shows your identity. Back shows services, bio and social links. Flip with one tap.',
    feature3Title: 'Your unique link',
    feature3Desc: 'vynk.app/c/yourname — share in bio, email signature, WhatsApp, or print on physical materials.',
    feature4Title: 'Secure ownership',
    feature4Desc: 'Locked to your account. Recover from any device with the same login. Anti-plagiarism built in.',
    feature5Title: 'Works worldwide',
    feature5Desc: 'Any country, any device, any browser. No download required. Share via QR, NFC or direct link.',
    feature6Title: 'Free updates',
    feature6Desc: 'Colors, bio, services, social links — free forever. Core identity changes from $10.',
    seePricingCta: 'See pricing →',

    pricingBadge: 'Pricing',
    pricingTitle: 'Simple, honest pricing.',
    pricingSubtext: 'No subscriptions. No hidden fees. Ever.',
    pricingOneTime: 'One-time payment — yours forever',
    check1: 'Card published at your unique link instantly',
    check2: 'QR code — scan saves contact to any phone',
    check3: 'Front & back card with flip animation',
    check4: 'All templates, fonts and design options',
    check5: 'Free color & content updates anytime',
    check6: 'Core identity changes: $10 per update',
    check7: 'NFC-compatible, works worldwide',
    pricingCta: 'Create my Vynk card',
    paymentMethods: 'Stripe · Apple Pay · Google Pay',

    // ── Sign in / Sign up
    createIdentity: 'Create your digital identity',
    smartIntro: 'Make every introduction smart',
    promoCode: 'Promo code',
    promoPlaceholder: 'VYNK2025',
    applyCode: 'Apply',
    orSkip: 'or skip',
    createAccount: 'Create Account →',
    alreadyAccount: 'Already have an account?',
    signIn: 'Sign in',
    noPhoneRequired: 'Phone number not required for this registration',
    phoneOptional: 'Phone number is optional',

    // ── Builder — identity
    identity: 'Identity',
    identitySub: '$10 to change',
    fullName: 'Full Name *',
    title: 'Title',
    company: 'Company',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    photo: 'Photo',
    logo: 'Logo',
    dragRepos: '(drag to reposition)',
    upload: 'Upload',

    // ── Builder — content
    contentFree: 'Content — always free',
    tagline: 'Tagline',
    bio: 'Bio',
    services: 'Services (comma-separated)',
    website: 'Website',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    twitter: 'Twitter / X',
    telegram: 'Telegram',
    tiktok: 'TikTok',
    youtube: 'YouTube',

    // ── Builder — design
    design: 'Design',
    photoFrame: 'Photo Frame',
    frameCircle: 'Circle',
    frameRounded: 'Rounded',
    frameSquare: 'Square',
    frameHex: 'Hex',
    frameBlob: 'Blob',
    photoScale: 'Photo scale',
    photoRotate: 'Photo rotate',
    photoCrop: 'Photo crop position',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    logoScale: 'Logo scale',
    logoRotate: 'Logo rotate',
    bgColor: 'BG',
    bg2Color: 'BG2',
    textColor: 'Text',
    accentColor: 'Accent',

    // ── Builder — tabs
    front: 'Front',
    back: 'Back',
    info: 'Info',
    preview: 'Preview',
    content: 'Content',

    // ── Builder — actions
    generateCard: '✨ Generate my card — $20',
    updateCard: 'Update card',
    oneTime: 'One-time payment · Colors & content free forever',
    freeChanges: 'Free changes instant · Identity $10',
    flipCard: 'Click to flip ↻',
    tapFlip: 'Tap to flip ↻',

    // ── Builder — identity change warning
    identityChange: 'Identity change detected',
    changedFields: 'Changed:',
    archiveWarning: 'Your current card will be archived and a new one published for',
    pay10: 'Pay $10 & update',

    // ── Builder — rotate hint
    rotateDevice: 'Rotate for better editing',
    rotateHint: 'Turn your device horizontally for full builder experience',
    tapDismiss: 'Tap anywhere to dismiss',

    // ── Builder — misc
    nameRequired: 'Full name is required',
    imgSize: 'Image must be under 5MB',
    promoApplied: 'Promo applied!',
    invalidCode: 'Invalid code',
    tapCard: 'Tap the card above to flip it',
    cardPublished: 'Card published!',

    // ── Card public page
    saveContact: '⬇ Save Contact',
    shareCard: 'Share this card',
    copy: 'Copy',
    copied: '✓ Copied!',
    poweredBy: 'Powered by',
    tapToFlip: 'tap to flip',

    // ── Checkout success
    publishing: 'Publishing',
    settingUp: 'Payment confirmed. Setting up your digital identity.',
    cardLive: 'Your card is live!',
    shareEverywhere: 'Share it everywhere. Every tap is a smart introduction.',
    viewMyCard: 'View my card →',
    editCard: 'Edit card',

    // ── Admin login
    ownerVault: 'Owner Vault',
    enterPin: 'Enter your 6-digit PIN',
    verifyPin: 'Verify PIN',
    verifying: 'Verifying…',
    checkEmail: 'Check your email',
    enterCode: 'Enter the 6-digit code sent to your inbox',
    enterVault: 'Enter Vault',
    backToPin: '← Back to PIN',
    wrongPin: 'Wrong PIN',
    attemptsLeft: 'attempt(s) left',
    networkError: 'Network error',
    codeSent: 'Code sent to your email',
    invalidOtp: 'Invalid or expired code.',

    // ── Legal
    termsTitle: 'Terms of Service',
    privacyTitle: 'Privacy Policy',
    refundsTitle: 'Refund Policy',
  },

  es: {
    // ── Nav / global
    backToVynk: 'Volver a Vynk',
    viewCard: 'Ver tarjeta →',
    cardBuilder: 'Constructor',
    save: 'Guardar',
    cancel: 'Cancelar',
    loading: 'Cargando…',
    processing: 'Procesando…',
    apply: 'Aplicar',
    edit: 'Editar',
    delete: 'Eliminar',
    enable: 'Activar',
    disable: 'Desactivar',
    active: 'Activo:',
    liveAt: 'En vivo en:',

    // ── Landing
    landingHero: 'Haz que cada presentación sea',
    landingCta: 'Crear mi tarjeta — $20',
    landingSubCta: 'Pago único · Sin suscripción',
    landingNavCta: 'Empieza — $20',
    landingBadge: 'Plataforma de Identidad Digital',
    landingHeroLine1: 'Haz',
    landingHeroLine2: 'cada',
    landingHeroLine3: 'presentación',
    landingHeroAccent: 'inteligente.',
    landingSubtext: 'Reemplaza tu tarjeta física con una identidad digital dinámica. Un escaneo QR — tu contacto se guarda al instante en cualquier teléfono.',
    howItWorksCta: 'Cómo funciona →',

    sectionIdentity: 'Plataforma de identidad',
    sectionHowItWorks: 'Cómo funciona',
    sectionFeatures: 'Funciones',
    sectionPricing: 'Precios',

    promo1: 'Un escaneo · Contacto guardado para siempre',
    promo2: 'Frente y reverso · Tarjeta digital de dos caras',
    promo3: 'Funciona en todo el mundo · Cualquier teléfono, cualquier navegador',
    promo4: 'Actualizaciones gratis · Cambios de identidad desde $10',
    promo5: 'Tu enlace único · vynk.app/c/yourname',

    howBadge: 'Cómo funciona',
    howTitleLine1: 'Tres pasos.',
    howTitleLine2: 'Una identidad.',
    howSubtext: 'Desde la configuración hasta compartir en menos de 3 minutos.',
    step1Title: 'Crea tu tarjeta',
    step1Desc: 'Completa tu identidad, sube foto o logo y elige plantillas, fuentes y colores en tiempo real. Todo se previsualiza al instante.',
    step2Title: 'Paga una vez, consérvala para siempre',
    step2Desc: 'Un solo pago de $20 activa tu tarjeta en tu enlace único y código QR. Sin suscripciones ni pagos mensuales.',
    step3Title: 'Compártela en cualquier lugar',
    step3Desc: 'Cualquiera escanea tu QR o abre tu enlace y guarda tu contacto en un toque. Funciona globalmente en cualquier dispositivo.',
    everythingIncludedCta: 'Todo incluido →',

    featuresBadge: 'Todo incluido',
    featuresTitleLine1: 'Una tarjeta.',
    featuresTitleLine2: 'Posibilidades infinitas.',
    feature1Title: 'Guardar en contactos',
    feature1Desc: 'Escaneo QR → el teléfono guarda el contacto al instante. Nombre, foto, teléfono y correo. Funciona en iPhone y Android.',
    feature2Title: 'Tarjeta frontal y reverso',
    feature2Desc: 'Dos caras. El frente muestra tu identidad. El reverso muestra servicios, biografía y redes sociales. Gira con un toque.',
    feature3Title: 'Tu enlace único',
    feature3Desc: 'vynk.app/c/yourname — compártelo en tu bio, firma de correo, WhatsApp o materiales impresos.',
    feature4Title: 'Propiedad segura',
    feature4Desc: 'Vinculada a tu cuenta. Recupérala desde cualquier dispositivo con el mismo inicio de sesión. Protección anti-plagio integrada.',
    feature5Title: 'Funciona en todo el mundo',
    feature5Desc: 'Cualquier país, cualquier dispositivo, cualquier navegador. No requiere descarga. Comparte por QR, NFC o enlace directo.',
    feature6Title: 'Actualizaciones gratis',
    feature6Desc: 'Colores, bio, servicios y redes sociales — gratis para siempre. Cambios de identidad desde $10.',
    seePricingCta: 'Ver precios →',

    pricingBadge: 'Precios',
    pricingTitle: 'Precios simples y honestos.',
    pricingSubtext: 'Sin suscripciones. Sin cargos ocultos. Nunca.',
    pricingOneTime: 'Pago único — es tuya para siempre',
    check1: 'Tarjeta publicada al instante en tu enlace único',
    check2: 'Código QR — un escaneo guarda el contacto en cualquier teléfono',
    check3: 'Tarjeta frontal y reverso con animación de giro',
    check4: 'Todas las plantillas, fuentes y opciones de diseño',
    check5: 'Actualizaciones gratis de color y contenido en cualquier momento',
    check6: 'Cambios de identidad: $10 por actualización',
    check7: 'Compatible con NFC, funciona en todo el mundo',
    pricingCta: 'Crear mi tarjeta Vynk',
    paymentMethods: 'Stripe · Apple Pay · Google Pay',

    // ── Sign in / Sign up
    createIdentity: 'Crea tu identidad digital',
    smartIntro: 'Haz que cada presentación sea inteligente',
    promoCode: 'Código promo',
    promoPlaceholder: 'VYNK2025',
    applyCode: 'Aplicar',
    orSkip: 'o salta',
    createAccount: 'Crear cuenta →',
    alreadyAccount: '¿Ya tienes cuenta?',
    signIn: 'Inicia sesión',
    noPhoneRequired: 'No se requiere número de teléfono para este registro',
    phoneOptional: 'El número de teléfono es opcional',

    // ── Builder — identity
    identity: 'Identidad',
    identitySub: '$10 para cambiar',
    fullName: 'Nombre completo *',
    title: 'Título',
    company: 'Empresa',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',
    email: 'Correo',
    photo: 'Foto',
    logo: 'Logo',
    dragRepos: '(arrastra para reposicionar)',
    upload: 'Subir',

    // ── Builder — content
    contentFree: 'Contenido — siempre gratis',
    tagline: 'Eslogan',
    bio: 'Bio',
    services: 'Servicios (separados por coma)',
    website: 'Sitio web',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    twitter: 'Twitter / X',
    telegram: 'Telegram',
    tiktok: 'TikTok',
    youtube: 'YouTube',

    // ── Builder — design
    design: 'Diseño',
    photoFrame: 'Marco de foto',
    frameCircle: 'Círculo',
    frameRounded: 'Redondeado',
    frameSquare: 'Cuadrado',
    frameHex: 'Hexágono',
    frameBlob: 'Blob',
    photoScale: 'Escala foto',
    photoRotate: 'Rotar foto',
    photoCrop: 'Posición del recorte',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    logoScale: 'Escala logo',
    logoRotate: 'Rotar logo',
    bgColor: 'Fondo',
    bg2Color: 'Fondo 2',
    textColor: 'Texto',
    accentColor: 'Acento',

    // ── Builder — tabs
    front: 'Frente',
    back: 'Reverso',
    info: 'Info',
    preview: 'Vista previa',
    content: 'Contenido',

    // ── Builder — actions
    generateCard: '✨ Crear mi tarjeta — $20',
    updateCard: 'Actualizar tarjeta',
    oneTime: 'Pago único · Colores y contenido gratis para siempre',
    freeChanges: 'Cambios gratis al instante · Identidad $10',
    flipCard: 'Clic para girar ↻',
    tapFlip: 'Toca para girar ↻',

    // ── Builder — identity change warning
    identityChange: 'Cambio de identidad detectado',
    changedFields: 'Cambiado:',
    archiveWarning: 'Tu tarjeta actual será archivada y se publicará una nueva por',
    pay10: 'Pagar $10 y actualizar',

    // ── Builder — rotate hint
    rotateDevice: 'Gira para mejor edición',
    rotateHint: 'Gira tu dispositivo horizontalmente para la experiencia completa',
    tapDismiss: 'Toca en cualquier lugar para cerrar',

    // ── Builder — misc
    nameRequired: 'El nombre es obligatorio',
    imgSize: 'La imagen debe ser menor a 5MB',
    promoApplied: '¡Promo aplicada!',
    invalidCode: 'Código inválido',
    tapCard: 'Toca la tarjeta para girarla',
    cardPublished: '¡Tarjeta publicada!',

    // ── Card public page
    saveContact: '⬇ Guardar contacto',
    shareCard: 'Compartir tarjeta',
    copy: 'Copiar',
    copied: '✓ ¡Copiado!',
    poweredBy: 'Creado con',
    tapToFlip: 'toca para girar',

    // ── Checkout success
    publishing: 'Publicando',
    settingUp: 'Pago confirmado. Configurando tu identidad digital.',
    cardLive: '¡Tu tarjeta está en vivo!',
    shareEverywhere: 'Compártela en todas partes. Cada toque es una presentación inteligente.',
    viewMyCard: 'Ver mi tarjeta →',
    editCard: 'Editar tarjeta',

    // ── Admin login
    ownerVault: 'Bóveda del Propietario',
    enterPin: 'Ingresa tu PIN de 6 dígitos',
    verifyPin: 'Verificar PIN',
    verifying: 'Verificando…',
    checkEmail: 'Revisa tu correo',
    enterCode: 'Ingresa el código de 6 dígitos enviado a tu correo',
    enterVault: 'Entrar a la bóveda',
    backToPin: '← Volver al PIN',
    wrongPin: 'PIN incorrecto',
    attemptsLeft: 'intento(s) restante(s)',
    networkError: 'Error de red',
    codeSent: 'Código enviado a tu correo',
    invalidOtp: 'Código inválido o expirado.',

    // ── Legal
    termsTitle: 'Términos de Servicio',
    privacyTitle: 'Política de Privacidad',
    refundsTitle: 'Política de Reembolsos',
  },
} satisfies Record<Lang, Record<string, string>>

export type TranslationKey = keyof typeof TRANSLATIONS.en

/* ─── Context ───────────────────────────────────────────────── */
interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof TRANSLATIONS.en
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => { },
  t: TRANSLATIONS.en,
})

/* ─── Provider ──────────────────────────────────────────────── */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  // Hydrate from localStorage on first client render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vynk_lang') as Lang | null
      if (stored === 'en' || stored === 'es') setLangState(stored)
    } catch { }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem('vynk_lang', l) } catch { }
    // Update <html lang> attribute for accessibility / SEO
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
    }
  }

  const t = TRANSLATIONS[lang]

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

/* ─── Hooks ─────────────────────────────────────────────────── */
export function useLang() { return useContext(LangContext) }
export function useT() { return useContext(LangContext).t }

/* ─── Flag SVGs (inline, no external dependency) ────────────── */
const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="60" height="40" fill="#B22234" />
    <rect y="3.08" width="60" height="3.08" fill="white" />
    <rect y="9.23" width="60" height="3.08" fill="white" />
    <rect y="15.38" width="60" height="3.08" fill="white" />
    <rect y="21.54" width="60" height="3.08" fill="white" />
    <rect y="27.69" width="60" height="3.08" fill="white" />
    <rect y="33.85" width="60" height="3.08" fill="white" />
    <rect width="24" height="21.54" fill="#3C3B6E" />
    {/* Stars — simplified 3×5 grid */}
    {[2, 6, 10, 14, 18, 22].map(cx =>
      [2, 4.5, 7, 9.5, 11.5].map(cy => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.8" fill="white" />
      ))
    )}
    {[4, 8, 12, 16, 20].map(cx =>
      [3.2, 5.7, 8.2, 10.7].map(cy => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.8" fill="white" />
      ))
    )}
  </svg>
)

const FlagES = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="60" height="40" fill="#c60b1e" />
    <rect y="10" width="60" height="20" fill="#ffc400" />
  </svg>
)

/* ─── Toggle button component ───────────────────────────────── */
// Use anywhere: <LangToggle /> or <LangToggle compact />
export function LangToggle({
  compact = false,
  style = {},
}: {
  compact?: boolean
  style?: React.CSSProperties
}) {
  const { lang, setLang } = useLang()
  const isEN = lang === 'en'

  return (
    <button
      onClick={() => setLang(isEN ? 'es' : 'en')}
      title={isEN ? 'Cambiar a Español' : 'Switch to English'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? '4px' : '6px',
        padding: compact ? '4px 8px' : '6px 12px',
        background: '#0D0F12',
        boxShadow: '3px 3px 8px #08090B, -2px -2px 6px #141720',
        border: '1px solid rgba(212,168,79,0.15)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontFamily: "'DM Sans',sans-serif",
        fontSize: compact ? '10px' : '11px',
        fontWeight: 700,
        color: '#D4A84F',
        letterSpacing: '.04em',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '4px 4px 12px #08090B, -2px -2px 8px #141720, 0 0 12px rgba(212,168,79,0.15)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '3px 3px 8px #08090B, -2px -2px 6px #141720'
      }}
    >
      {isEN ? <FlagUS /> : <FlagES />}
      {!compact && <span>{isEN ? 'EN' : 'ES'}</span>}
      <span style={{ opacity: 0.5, fontSize: compact ? '9px' : '10px' }}>
        {isEN ? '→ ES' : '→ EN'}
      </span>
    </button>
  )
}
