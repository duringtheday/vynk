'use client'
// src/app/admin/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const C = { g: '#0D0F12', gold: '#D4A84F', goldLt: '#E8C06A', goldDk: '#A07830', silver: '#BFC3C9', smoke: '#6F737A', carbon: '#050607', nd: '#08090B', nl: '#141720', red: '#ef4444', green: '#22c55e' }
const raised = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox = `4px 4px 14px ${C.nd}, 0 0 22px rgba(212,168,79,0.2)`

type PhoneMode = 'required' | 'optional' | 'off'
type Section = 'overview' | 'clients' | 'orders' | 'accounting' | 'metrics' | 'promos' | 'business' | 'security'

const fmt$ = (c: number) => `$${(c / 100).toFixed(2)}`
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.g, boxShadow: raised, borderRadius: '18px', padding: '20px 22px', border: '1px solid rgba(255,255,255,0.03)', flex: '1 1 150px', minWidth: '130px' }}>
      <div style={{ fontSize: '10px', color: C.smoke, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: C.gold, fontFamily: "'Syne',sans-serif" }}>{value}</div>
    </div>
  )
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.g, boxShadow: raised, borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)', ...style }}>{children}</div>
}
function SHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '20px', fontWeight: 800, color: C.silver, marginBottom: '3px' }}>{title}</h2>
      {sub && <p style={{ fontSize: '13px', color: C.smoke }}>{sub}</p>}
    </div>
  )
}

// Input neumórfico reutilizable
function NmInput({ value, onChange, placeholder, style }: { value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '9px 12px',
        background: C.g, boxShadow: insetSm,
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '10px', color: C.silver,
        fontSize: '13px', fontFamily: "'DM Sans',sans-serif",
        outline: 'none', ...style,
      }}
    />
  )
}

// Stepper +/− con input manual
function Stepper({ value, onChange, min = 0, max = 9999, label }: { value: string; onChange: (v: string) => void; min?: number; max?: number; label?: string }) {
  const num = parseInt(value) || 0
  return (
    <div>
      {label && <div style={{ fontSize: '10px', color: C.smoke, marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onChange(String(Math.max(min, num - 1)))}
          style={{ width: '32px', height: '34px', background: C.g, boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', color: C.silver, fontSize: '16px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          −
        </button>
        <input
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/, ''))}
          style={{
            flex: 1, padding: '9px 10px', textAlign: 'center',
            background: C.g, boxShadow: insetSm,
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '10px', color: C.silver,
            fontSize: '13px', fontFamily: "'DM Sans',sans-serif", outline: 'none',
          }}
        />
        <button
          onClick={() => onChange(String(Math.min(max, num + 1)))}
          style={{ width: '32px', height: '34px', background: C.g, boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', color: C.gold, fontSize: '16px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          +
        </button>
      </div>
    </div>
  )
}

// Toggle sin límite / con límite para maxUses
function MaxUsesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const unlimited = value === ''
  return (
    <div>
      <div style={{ fontSize: '10px', color: C.smoke, marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Máx. usos</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={() => onChange(unlimited ? '10' : '')}
          style={{
            width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: !unlimited ? `linear-gradient(135deg,${C.gold},${C.goldLt})` : C.g,
            boxShadow: !unlimited ? `0 0 8px rgba(212,168,79,0.3)` : insetSm,
            position: 'relative', flexShrink: 0, transition: 'all .2s',
          }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: !unlimited ? C.carbon : C.smoke, position: 'absolute', top: '3px', left: !unlimited ? '19px' : '3px', transition: 'left .2s' }} />
        </button>
        <span style={{ fontSize: '11px', color: !unlimited ? C.gold : C.smoke }}>
          {unlimited ? 'Sin límite (ilimitado)' : 'Número específico'}
        </span>
      </div>
      {!unlimited && (
        <Stepper value={value} onChange={onChange} min={1} />
      )}
    </div>
  )
}

// Campo fecha límite
function ExpiresField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hasDate = value !== ''
  return (
    <div>
      <div style={{ fontSize: '10px', color: C.smoke, marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Fecha límite</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={() => onChange(hasDate ? '' : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])}
          style={{
            width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: hasDate ? `linear-gradient(135deg,${C.gold},${C.goldLt})` : C.g,
            boxShadow: hasDate ? `0 0 8px rgba(212,168,79,0.3)` : insetSm,
            position: 'relative', flexShrink: 0, transition: 'all .2s',
          }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: hasDate ? C.carbon : C.smoke, position: 'absolute', top: '3px', left: hasDate ? '19px' : '3px', transition: 'left .2s' }} />
        </button>
        <span style={{ fontSize: '11px', color: hasDate ? C.gold : C.smoke }}>
          {hasDate ? 'Con fecha de expiración' : 'Sin fecha límite'}
        </span>
      </div>
      {hasDate && (
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px',
            background: C.g, boxShadow: insetSm,
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '10px', color: C.silver,
            fontSize: '13px', fontFamily: "'DM Sans',sans-serif",
            outline: 'none', colorScheme: 'dark',
          }}
        />
      )}
    </div>
  )
}

// Toggle neumórfico genérico
function NmToggle({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => onChange(!value)}
        style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', background: value ? `linear-gradient(135deg,${C.gold},${C.goldLt})` : C.g, boxShadow: value ? `0 0 10px rgba(212,168,79,0.3)` : insetSm, position: 'relative', flexShrink: 0, transition: 'all .2s' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: value ? C.carbon : C.smoke, position: 'absolute', top: '3px', left: value ? '21px' : '3px', transition: 'left .2s' }} />
      </button>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: value ? C.gold : C.silver }}>{label} — {value ? 'ON' : 'OFF'}</div>
        {desc && <div style={{ fontSize: '11px', color: C.smoke }}>{desc}</div>}
      </div>
    </div>
  )
}

// Botón neumórfico reutilizable
function NmBtn({ onClick, children, variant = 'default', style }: { onClick: () => void; children: React.ReactNode; variant?: 'default' | 'gold' | 'danger'; style?: React.CSSProperties }) {
  const bg = variant === 'gold'
    ? `linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`
    : C.g
  const color = variant === 'gold' ? C.carbon : variant === 'danger' ? C.red : C.smoke
  const shadow = variant === 'gold' ? goldBox : raisedSm
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 18px', background: bg, boxShadow: shadow,
        color, borderRadius: '10px', fontSize: '12px', fontWeight: variant === 'gold' ? 700 : 500,
        border: variant === 'danger' ? `1px solid rgba(239,68,68,0.2)` : '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
        transition: 'all .15s', ...style,
      }}>
      {children}
    </button>
  )
}

function PhoneModeToggle() {
  const [mode, setMode] = useState<PhoneMode>('required')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/phone-settings')
      const d = await r.json()
      if (d.mode) setMode(d.mode)
    } catch { toast.error('No se pudo cargar la config del teléfono') }
    setLoading(false)
  }

  async function apply(m: PhoneMode) {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/phone-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: m }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMode(m)
      toast.success(`Filtro de teléfono: ${m}`)
    } catch (e: any) { toast.error('Error: ' + e.message) }
    setSaving(false)
  }

  const OPTS: [PhoneMode, string, string, string][] = [
    ['required', '🔒', 'Obligatorio', 'El usuario DEBE ingresar teléfono. Máxima seguridad.'],
    ['optional', '⚡', 'Opcional', 'Campo visible pero no requerido. Todos pueden pasar.'],
    ['off', '📵', 'Desactivado', 'Campo oculto completamente. Máxima accesibilidad.'],
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <span style={{ fontSize: '24px' }}>📱</span>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: C.silver }}>Filtro de Número de Teléfono</div>
          <div style={{ fontSize: '12px', color: C.smoke }}>Controla si el teléfono es obligatorio en el registro</div>
        </div>
        {loading && <span style={{ marginLeft: 'auto', fontSize: '12px', color: C.smoke }}>Cargando…</span>}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {OPTS.map(([key, icon, label, desc]) => {
          const isActive = mode === key
          const color = key === 'required' ? C.red : key === 'optional' ? C.gold : C.smoke
          return (
            <button key={key} onClick={() => !saving && !loading && apply(key as PhoneMode)} disabled={saving || loading}
              style={{ flex: '1 1 150px', padding: '16px 14px', textAlign: 'left', borderRadius: '14px', border: isActive ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.03)', background: C.g, boxShadow: isActive ? insetSm : raisedSm, cursor: saving || loading ? 'not-allowed' : 'pointer', transition: 'all .2s', opacity: saving ? .6 : 1 }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? color : C.silver, marginBottom: '4px' }}>
                {label} {isActive && <span style={{ marginLeft: '7px', fontSize: '9px', background: `${color}20`, color, padding: '2px 6px', borderRadius: '5px', fontWeight: 700 }}>ACTIVO</span>}
              </div>
              <div style={{ fontSize: '11px', color: C.smoke, lineHeight: 1.5 }}>{desc}</div>
            </button>
          )
        })}
      </div>
      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', color: C.smoke, lineHeight: 1.7 }}>
        💡 <strong style={{ color: C.silver }}>Bypass por código promo:</strong> Aunque esté en "Obligatorio", si el usuario aplica un código con <em>Phone Bypass ON</em>, el campo se oculta solo para él. Configúralo en <strong style={{ color: C.gold }}>Códigos Promo</strong>.
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [active, setActive] = useState<Section>('overview')
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [newPromo, setNewPromo] = useState({
    code: '', discountType: 'percent', discountValue: '0',
    appliesTo: 'both', maxUses: '', expiresAt: '', phoneBypass: false,
  })
  const [editPromo, setEditPromo] = useState<any>(null)

  useEffect(() => { if (active !== 'business') fetchSection(active) }, [active])

  async function fetchSection(s: Section) {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/dashboard?section=${s}`)
      if (r.status === 401) { router.push('/admin/login'); return }
      const json = await r.json()
      setData((p: any) => ({ ...p, [s]: json }))
    } catch { toast.error('Error al cargar datos') }
    setLoading(false)
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  async function createPromo() {
    if (!newPromo.code) return toast.error('El código es requerido')
    const r = await fetch('/api/admin/dashboard', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newPromo,
        discountValue: Number(newPromo.discountValue) || 0,
        maxUses: newPromo.maxUses ? Number(newPromo.maxUses) : null,
        expiresAt: newPromo.expiresAt || null,
      }),
    })
    const d = await r.json()
    if (!r.ok) return toast.error(d.error)
    toast.success('Código creado')
    setNewPromo({ code: '', discountType: 'percent', discountValue: '0', appliesTo: 'both', maxUses: '', expiresAt: '', phoneBypass: false })
    fetchSection('promos')
  }

  async function togglePromo(id: string, isActive: boolean) {
    await fetch('/api/admin/dashboard', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive }) })
    fetchSection('promos')
  }

  async function deletePromo(id: string) {
    if (!confirm('¿Eliminar este código?')) return
    await fetch('/api/admin/dashboard', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Eliminado'); fetchSection('promos')
  }

  async function saveEdit() {
    await fetch('/api/admin/dashboard', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update', ...editPromo,
        discountValue: Number(editPromo.discountValue) || 0,
        maxUses: editPromo.maxUses ? Number(editPromo.maxUses) : null,
        expiresAt: editPromo.expiresAt || null,
      }),
    })
    toast.success('Actualizado'); setEditPromo(null); fetchSection('promos')
  }

  const NAV: { key: Section; icon: string; label: string }[] = [
    { key: 'overview', icon: '⚡', label: 'Overview' },
    { key: 'clients', icon: '👥', label: 'Clientes' },
    { key: 'orders', icon: '💳', label: 'Órdenes' },
    { key: 'accounting', icon: '📊', label: 'Contabilidad' },
    { key: 'metrics', icon: '📈', label: 'Métricas' },
    { key: 'promos', icon: '🎟', label: 'Códigos Promo' },
    { key: 'business', icon: '⚙️', label: 'Business Rules' },
    { key: 'security', icon: '🔐', label: 'Seguridad' },
  ]

  function renderOverview() {
    const d = data.overview; if (!d) return null
    return <>
      <SHead title="Overview" sub="Resumen en tiempo real" />
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <Stat label="Hoy" value={fmt$(d.todayCents || 0)} />
        <Stat label="Total" value={fmt$(d.totalCents || 0)} />
        <Stat label="Tarjetas Activas" value={String(d.activeCards || 0)} />
        <Stat label="Usuarios" value={String(d.totalUsers || 0)} />
      </div>
      <Card>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.silver, marginBottom: '14px' }}>Pagos Recientes</div>
        {!d.recentPayments?.length ? <div style={{ color: C.smoke, fontSize: '13px' }}>Sin pagos aún.</div>
          : d.recentPayments.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: C.silver, fontWeight: 600 }}>{fmt$(p.amount_cents)} · {p.type}</div>
                <div style={{ fontSize: '11px', color: C.smoke }}>{fmtDate(p.created_at)}</div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.status === 'paid' ? C.green : C.red }}>{p.status?.toUpperCase()}</span>
            </div>
          ))}
      </Card>
    </>
  }

  function renderClients() {
    const d = data.clients; if (!d) return null
    return <>
      <SHead title="Clientes" sub={`${d.clients?.length || 0} usuarios registrados`} />
      <Card>
        {!d.clients?.length ? <div style={{ color: C.smoke, fontSize: '13px' }}>Sin usuarios.</div>
          : d.clients.map((u: any) => (
            <div key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '13px', color: C.silver, fontWeight: 600 }}>{u.email}</div>
              <div style={{ fontSize: '11px', color: C.smoke }}>{u.clerk_id} · {fmtDate(u.created_at)}</div>
            </div>
          ))}
      </Card>
    </>
  }

  function renderOrders() {
    const d = data.orders; if (!d) return null
    return <>
      <SHead title="Órdenes" sub="Todos los registros de pago" />
      <Card>
        {!d.orders?.length ? <div style={{ color: C.smoke, fontSize: '13px' }}>Sin órdenes.</div>
          : d.orders.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: C.silver, fontWeight: 600 }}>{fmt$(p.amount_cents)} · {p.type}</div>
                <div style={{ fontSize: '11px', color: C.smoke }}>{p.user_id} · {fmtDate(p.created_at)}</div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.status === 'paid' ? C.green : C.red }}>{p.status?.toUpperCase()}</span>
            </div>
          ))}
      </Card>
    </>
  }

  function renderAccounting() {
    const d = data.accounting; if (!d) return null
    return <>
      <SHead title="Contabilidad" sub="Desglose mensual" />
      <Card>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.silver, marginBottom: '14px' }}>Por Mes</div>
        {!d.monthly?.length ? <div style={{ color: C.smoke, fontSize: '13px' }}>Sin datos.</div>
          : d.monthly.map((r: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', color: C.smoke, minWidth: '80px' }}>{r.month}</div>
              <div style={{ fontSize: '13px', color: C.gold, fontWeight: 700 }}>{fmt$(Number(r.gross_cents))}</div>
              <div style={{ fontSize: '12px', color: C.smoke }}>neto {fmt$(Number(r.net_cents))}</div>
              <div style={{ fontSize: '11px', color: C.smoke }}>{r.transactions} txn</div>
            </div>
          ))}
      </Card>
    </>
  }

  function renderMetrics() {
    const d = data.metrics; if (!d) return null
    return <>
      <SHead title="Métricas" sub="Vistas y guardados" />
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Stat label="Vistas Totales" value={String(d.totalViews || 0)} />
        <Stat label="Contactos Guardados" value={String(d.totalSaves || 0)} />
      </div>
      <Card>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.silver, marginBottom: '12px' }}>Por País</div>
        {d.byCountry?.map((r: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '13px', color: C.silver }}>{r.country || 'Desconocido'}</span>
            <span style={{ fontSize: '13px', color: C.gold, fontWeight: 700 }}>{r.cnt}</span>
          </div>
        ))}
      </Card>
    </>
  }

  function renderPromos() {
    const d = data.promos
    return <>
      <SHead title="Códigos Promo" sub="Crea y administra descuentos" />
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.silver, marginBottom: '16px' }}>Nuevo Código</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '14px' }}>

          {/* Código */}
          <div>
            <div style={{ fontSize: '10px', color: C.smoke, marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Código</div>
            <NmInput value={newPromo.code} onChange={v => setNewPromo(p => ({ ...p, code: v.toUpperCase() }))} placeholder="SUMMER25" />
          </div>

          {/* Valor con stepper */}
          <Stepper label="Valor" value={newPromo.discountValue} onChange={v => setNewPromo(p => ({ ...p, discountValue: v }))} />

          {/* Tipo */}
          <div>
            <div style={{ fontSize: '10px', color: C.smoke, marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Tipo</div>
            <select value={newPromo.discountType} onChange={e => setNewPromo(p => ({ ...p, discountType: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', background: C.g, boxShadow: insetSm, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', color: C.silver, fontSize: '13px', fontFamily: "'DM Sans',sans-serif", outline: 'none' }}>
              <option value="percent">Porcentaje %</option>
              <option value="fixed">Fijo $</option>
              <option value="free">Gratis</option>
            </select>
          </div>

          {/* Aplica a */}
          <div>
            <div style={{ fontSize: '10px', color: C.smoke, marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Aplica a</div>
            <select value={newPromo.appliesTo} onChange={e => setNewPromo(p => ({ ...p, appliesTo: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', background: C.g, boxShadow: insetSm, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', color: C.silver, fontSize: '13px', fontFamily: "'DM Sans',sans-serif", outline: 'none' }}>
              <option value="both">Ambos</option>
              <option value="new_card">Tarjeta nueva</option>
              <option value="renewal">Renovación</option>
            </select>
          </div>

          {/* Máx usos con toggle sin límite */}
          <MaxUsesField value={newPromo.maxUses} onChange={v => setNewPromo(p => ({ ...p, maxUses: v }))} />

          {/* Fecha límite con toggle */}
          <ExpiresField value={newPromo.expiresAt} onChange={v => setNewPromo(p => ({ ...p, expiresAt: v }))} />

        </div>

        {/* Phone Bypass */}
        <div style={{ marginBottom: '14px' }}>
          <NmToggle
            value={newPromo.phoneBypass}
            onChange={v => setNewPromo(p => ({ ...p, phoneBypass: v }))}
            label="Phone Bypass"
            desc="Oculta el campo de teléfono para los usuarios que usen este código"
          />
        </div>

        <NmBtn onClick={createPromo} variant="gold" style={{ padding: '11px 24px', fontSize: '13px' }}>
          + Crear Código
        </NmBtn>
      </Card>

      <Card>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.silver, marginBottom: '14px' }}>Códigos Existentes</div>
        {!d ? <div style={{ color: C.smoke, fontSize: '13px' }}>Cargando…</div>
          : !d.promos?.length ? <div style={{ color: C.smoke, fontSize: '13px' }}>Sin códigos aún.</div>
            : d.promos.map((p: any) => (
              <div key={p.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {editPromo?.id === p.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
                      <Stepper label="Valor" value={String(editPromo.discountValue || 0)} onChange={v => setEditPromo((x: any) => ({ ...x, discountValue: v }))} />
                      <MaxUsesField value={editPromo.maxUses ? String(editPromo.maxUses) : ''} onChange={v => setEditPromo((x: any) => ({ ...x, maxUses: v }))} />
                      <ExpiresField
                        value={editPromo.expiresAt ? new Date(editPromo.expiresAt).toISOString().split('T')[0] : ''}
                        onChange={v => setEditPromo((x: any) => ({ ...x, expiresAt: v }))}
                      />
                    </div>
                    <NmToggle
                      value={editPromo.phoneBypass}
                      onChange={v => setEditPromo((x: any) => ({ ...x, phoneBypass: v }))}
                      label="Phone Bypass"
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <NmBtn onClick={saveEdit} variant="gold">Guardar</NmBtn>
                      <NmBtn onClick={() => setEditPromo(null)}>Cancelar</NmBtn>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: C.gold, fontSize: '14px', letterSpacing: '0.06em' }}>{p.code}</span>
                        {p.phoneBypass && <span style={{ fontSize: '10px', background: 'rgba(212,168,79,0.1)', color: C.gold, padding: '2px 7px', borderRadius: '5px', fontWeight: 700 }}>📵 PHONE BYPASS</span>}
                        <span style={{ fontSize: '10px', background: p.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.isActive ? C.green : C.red, padding: '2px 7px', borderRadius: '5px', fontWeight: 700 }}>{p.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: C.smoke }}>
                        {p.discountType === 'percent' ? `${p.discountValue}%` : p.discountType === 'fixed' ? `$${(p.discountValue / 100).toFixed(2)}` : 'Gratis'} · {p.appliesTo}
                        {p.maxUses ? ` · ${p.usesCount}/${p.maxUses} usos` : ' · ilimitado'}
                        {p.expiresAt ? ` · expira ${fmtDate(p.expiresAt)}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '7px', flexShrink: 0 }}>
                      <NmBtn onClick={() => setEditPromo({ ...p, discountValue: String(p.discountValue || 0), maxUses: p.maxUses ? String(p.maxUses) : '', phoneBypass: !!(p.phoneBypass || p.phone_bypass), expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString().split('T')[0] : '' })}>Editar</NmBtn>
                      <NmBtn onClick={() => togglePromo(p.id, !p.isActive)} variant={p.isActive ? 'danger' : 'default'} style={{ color: p.isActive ? C.red : C.green }}>{p.isActive ? 'Desactivar' : 'Activar'}</NmBtn>
                      <NmBtn onClick={() => deletePromo(p.id)} variant="danger">Eliminar</NmBtn>
                    </div>
                  </div>
                )}
              </div>
            ))}
      </Card>
    </>
  }

  function renderBusiness() {
    return <>
      <SHead title="Business Rules" sub="Control del comportamiento de la plataforma sin tocar código" />
      <Card style={{ marginBottom: '16px' }}><PhoneModeToggle /></Card>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: .45 }}>
          <span style={{ fontSize: '20px' }}>🔮</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.silver }}>Más reglas próximamente</div>
            <div style={{ fontSize: '12px', color: C.smoke }}>Rate limiting, geo-blocking, sistema de referidos, Virtual Phone API — Handoff 03+</div>
          </div>
        </div>
      </Card>
    </>
  }

  function renderSecurity() {
    const d = data.security; if (!d) return null
    return <>
      <SHead title="Seguridad" sub="Log de acceso al admin" />
      <Card>
        {!d.logs?.length ? <div style={{ color: C.smoke, fontSize: '13px' }}>Sin eventos.</div>
          : d.logs.map((l: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: l.event === 'login_success' ? C.green : l.event?.includes('fail') ? C.red : C.silver, fontWeight: 600 }}>{l.event}</div>
                <div style={{ fontSize: '11px', color: C.smoke }}>{l.ip} · {fmtDate(l.created_at)}</div>
              </div>
            </div>
          ))}
      </Card>
    </>
  }

  const RENDER: Record<Section, () => React.ReactNode> = { overview: renderOverview, clients: renderClients, orders: renderOrders, accounting: renderAccounting, metrics: renderMetrics, promos: renderPromos, business: renderBusiness, security: renderSecurity }

  return (
    <div style={{ minHeight: '100dvh', background: C.g, fontFamily: "'DM Sans',sans-serif", display: 'flex' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '220px', flexShrink: 0, background: C.g, boxShadow: `4px 0 20px ${C.nd}`, borderRight: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', padding: '28px 16px' }}>
        <div style={{ padding: '12px 16px', background: C.g, boxShadow: raised, borderRadius: '14px', marginBottom: '28px', border: '1px solid rgba(212,168,79,0.07)' }}>
          <img src="/logo.png" alt="Vynk" style={{ height: '28px', objectFit: 'contain', display: 'block' }} />
        </div>
        <div style={{ fontSize: '9px', color: C.smoke, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '8px' }}>Admin Panel</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setActive(n.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '12px',
                // neumorfismo: raised cuando inactivo, inset cuando activo
                background: C.g,
                boxShadow: active === n.key ? insetSm : raised,
                border: active === n.key ? '1px solid rgba(212,168,79,0.1)' : '1px solid rgba(255,255,255,0.02)',
                color: active === n.key ? C.gold : C.smoke,
                fontSize: '13px', fontWeight: active === n.key ? 700 : 400,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                textAlign: 'left', transition: 'all .15s',
              }}>
              <span style={{ fontSize: '15px' }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <button onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: C.g, boxShadow: raisedSm, border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.7)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginTop: '8px' }}>
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '36px 32px', overflowY: 'auto', minWidth: 0 }}>
        {loading
          ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: C.smoke, fontSize: '14px' }}>Cargando…</div>
          : RENDER[active]?.()
        }
      </main>
    </div>
  )
}
