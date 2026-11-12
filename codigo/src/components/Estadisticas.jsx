import { useState } from 'react'
import { CATEGORIAS, cat, mezcla, porcentaje, porcentajeGlobal, rachaActual, rachaRecord, rachasGenerales, resumenDia } from '../lib/habitos'
import { IconoHabito } from './Habito'
import { DIAS, clave, sumarDias, hoy, lunesDe } from '../lib/fechas'

const SEMANAS = 20
const NIVELES = ['#EEEEEC', '#BDBDC4', '#8E8E96', '#52525B', '#18181B']
// Escala de una categoría: vacío → pastel → … → tono fuerte de la categoría
const escala = (c) => ['#EEEEEC', mezcla(c.suave, c.fuerte, 0.12), mezcla(c.suave, c.fuerte, 0.4), mezcla(c.suave, c.fuerte, 0.7), c.fuerte]
const nivel = (p) => (p === 1 ? 4 : p >= 0.66 ? 3 : p >= 0.33 ? 2 : 1)
const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const mes = new Intl.DateTimeFormat('es-ES', { month: 'short' })

export default function Estadisticas({ habitos: todos, compacta = false }) {
  const [filtro, setFiltro] = useState('todas')
  const presentes = Object.keys(CATEGORIAS).filter((k) => todos.some((h) => (CATEGORIAS[h.categoria] ? h.categoria : 'otros') === k))
  const elegida = presentes.includes(filtro) ? filtro : 'todas'
  const habitos = elegida === 'todas' ? todos : todos.filter((h) => (CATEGORIAS[h.categoria] ? h.categoria : 'otros') === elegida)
  const colores = elegida === 'todas' ? NIVELES : escala(CATEGORIAS[elegida])
  const { actual, record } = rachasGenerales(habitos)
  const total = habitos.reduce((s, h) => s + Object.keys(h.hechos).length, 0)
  const media = porcentajeGlobal(habitos, 30) ?? 0
  const cifras = [['Racha', `${actual}d`], ['Récord', `${record}d`], ['30 días', `${media}%`], ['Marcados', total]]

  const hoyK = clave(hoy())
  const ini = sumarDias(lunesDe(hoy()), -(SEMANAS - 1) * 7)
  const dias = Array.from({ length: SEMANAS * 7 }, (_, i) => sumarDias(ini, i))
  const meses = [0, 6, 12, 19].map((s) => mes.format(dias[s * 7]).replace('.', ''))
  let dt = 0, dc = 0
  for (const d of dias) { if (clave(d) > hoyK) break; const r = resumenDia(habitos, d); if (r.total) { dt++; if (r.hechos === r.total) dc++ } }

  return (
    <>
      {compacta ? <h2 className="px-1 text-[15px] font-semibold">Últimas {SEMANAS} semanas</h2> : (
      <header className="px-1">
        <p className="text-[13px] text-sec">Últimas {SEMANAS} semanas</p>
        <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight">Estadísticas</h1>
      </header>)}

      {presentes.length > 1 && (
        <div className="-mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por categoría">
          {['todas', ...presentes].map((k) => {
            const c = CATEGORIAS[k], on = elegida === k
            return (
              <button key={k} onClick={() => setFiltro(k)} aria-pressed={on}
                className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] ${!c && on ? 'bg-tinta text-white' : !c ? 'bg-pista text-sec' : 'text-tinta'}`}
                style={c ? { background: c.suave, boxShadow: on ? `inset 0 0 0 1.5px ${c.fuerte}` : undefined, fontWeight: on ? 600 : 400 } : undefined}>
                {c && <span className="size-2 rounded-full" style={{ background: c.fuerte }} />}{c ? c.nombre : 'Todas'}
              </button>
            )
          })}
        </div>
      )}

      <section className="mt-3 grid grid-cols-4 gap-2">
        {cifras.map(([t, v]) => (
          <div key={t} className="rounded-xl border border-linea bg-carta p-3">
            <p className="text-[11px] text-sec">{t}</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{v}</p>
          </div>
        ))}
      </section>

      <section className="mt-3 rounded-2xl border border-linea bg-carta p-3.5">
        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-px text-[9px] leading-none text-sec" aria-hidden="true">{DIAS.map((d) => <span key={d.n}>{d.corto}</span>)}</div>
          <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]" role="img"
            aria-label={`${elegida === 'todas' ? '' : CATEGORIAS[elegida].nombre + ', '}últimas ${SEMANAS} semanas: ${dc} de ${dt} días con todos los hábitos hechos`}>
            {dias.map((d) => {
              const k = clave(d)
              if (k > hoyK) return <span key={k} />
              const { total: t, hechos: n } = resumenDia(habitos, d)
              return <span key={k} title={`${fmt.format(d)}: ${n}/${t}`} className="aspect-square rounded-[3px]"
                style={{ background: colores[t && n ? nivel(n / t) : 0] }} />
            })}
          </div>
        </div>
        <div className="mt-2.5 flex justify-between pl-4 text-[11px] text-sec">{meses.map((m, i) => <span key={i}>{m}</span>)}</div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-sec">
          Menos {colores.map((c) => <span key={c} className="size-2.5 rounded-[2px]" style={{ background: c }} />)} Más
        </div>
      </section>

      {habitos.length > 0 && !compacta && (
        <>
          <div className="mt-5 mb-2 flex justify-between px-1 text-[13px] text-sec"><span>Por hábito · 30 días</span><span>racha / récord</span></div>
          <ul className="overflow-hidden rounded-2xl border border-linea bg-carta">
            {habitos.map((h) => {
              const p = porcentaje(h, 30), { suave, fuerte } = cat(h)
              return (
                <li key={h.id} className="flex items-center gap-3 border-t border-linea px-3.5 py-3 first:border-t-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[9px]" style={{ background: suave, color: fuerte }}><IconoHabito h={h} size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{h.nombre}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-pista"><div className="h-full rounded-full" style={{ width: `${p ?? 0}%`, background: fuerte }} /></div>
                  </div>
                  <div className="w-16 shrink-0 text-right font-mono tabular-nums">
                    <p className="text-[13px]">{rachaActual(h)}<span className="text-sec">/{rachaRecord(h)}d</span></p>
                    <p className="mt-0.5 text-[11px] text-sec">{p ?? '–'}%</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )
}
