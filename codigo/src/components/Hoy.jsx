import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { ORDEN_MOMENTO, tocaEl, hecho, rachaActual, resumenDia } from '../lib/habitos'
import { DIAS, clave, sumarDias, hoy, lunesDe } from '../lib/fechas'
import Habito from './Habito'

const fmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })

function Aro({ p }) {
  const r = 12, L = 2 * Math.PI * r
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" className="-rotate-90" aria-hidden="true">
      <circle cx="15" cy="15" r={r} fill="none" strokeWidth="3" stroke="#D4D4D8" />
      {p > 0 && <circle cx="15" cy="15" r={r} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-tinta transition-[stroke-dashoffset] duration-300"
        strokeDasharray={L} strokeDashoffset={L * (1 - p)} />}
    </svg>
  )
}

export default function Hoy({ habitos, dia, setDia, alAlternar, alEditar }) {
  const [verOtros, setVerOtros] = useState(false)
  const hoyK = clave(hoy()), esHoy = clave(dia) === hoyK
  const lunes = lunesDe(dia)
  const primera = habitos.reduce((m, h) => (h.creado < m ? h.creado : m), hoyK)
  const semana = DIAS.map((_, i) => sumarDias(lunes, i))
  const deDia = habitos.filter((h) => tocaEl(h, dia))
    .sort((a, b) => hecho(a, dia) - hecho(b, dia) || ORDEN_MOMENTO[a.momento] - ORDEN_MOMENTO[b.momento])
  const otros = habitos.filter((h) => !tocaEl(h, dia))
  const { total, hechos } = resumenDia(habitos, dia)
  const pct = total ? Math.round((hechos / total) * 100) : 0

  return (
    <>
      <header className="flex items-end justify-between px-1">
        <div>
          <p className="text-[13px] text-sec first-letter:uppercase">{fmt.format(dia)}</p>
          <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight">{esHoy ? 'Hoy' : 'Corrigiendo'}</h1>
        </div>
        <p className="pb-1 font-mono text-[13px] text-sec">{total ? <>{hechos}/{total} · <span className="text-tinta">{pct}%</span></> : 'sin hábitos'}</p>
      </header>

      <div className="mt-4 flex items-center gap-0.5">
      <button onClick={() => setDia(sumarDias(lunes, -1))} disabled={clave(lunes) <= primera} aria-label="Semana anterior"
        className="grid h-11 w-6 shrink-0 place-items-center text-sec disabled:opacity-25"><ChevronLeft size={18} /></button>
      <div className="grid flex-1 grid-cols-7 gap-0.5" role="group" aria-label="Días de la semana">
        {semana.map((d, i) => {
          const k = clave(d), futuro = k > hoyK, sel = k === clave(dia)
          const r = resumenDia(habitos, d)
          return (
            <button key={k} disabled={futuro} onClick={() => setDia(d)} aria-pressed={sel}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-2 disabled:opacity-35 ${sel ? 'bg-carta shadow-[0_0_0_1px_var(--color-linea)]' : ''}`}>
              <span className={`text-[11px] ${sel ? 'font-semibold' : 'text-sec'}`}>{DIAS[i].corto}</span>
              <Aro p={futuro || !r.total ? 0 : r.hechos / r.total} />
              <span className={`font-mono text-[11px] ${k === hoyK ? 'font-medium text-tinta' : 'text-sec'}`}>{d.getDate()}</span>
              <span className="sr-only">, {DIAS[i].largo}: {r.hechos} de {r.total}</span>
            </button>
          )
        })}
      </div>
      <button onClick={() => setDia(clave(sumarDias(lunes, 7)) > hoyK ? hoy() : sumarDias(lunes, 7))} disabled={clave(sumarDias(lunes, 6)) >= hoyK} aria-label="Semana siguiente"
        className="grid h-11 w-6 shrink-0 place-items-center text-sec disabled:opacity-25"><ChevronRight size={18} /></button>
      </div>

      <div className="mx-1 mt-4 h-1 overflow-hidden rounded-full bg-pista">
        <div className="h-full rounded-full bg-tinta transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      {!esHoy && (
        <button onClick={() => setDia(hoy())} className="mt-3 w-full rounded-xl bg-carta py-2.5 text-sm font-medium shadow-[0_0_0_1px_var(--color-linea)]">Volver a hoy</button>
      )}

      {habitos.length === 0 ? (
        <p className="mt-10 text-center text-sec">Aún no tienes hábitos. Pulsa <b className="text-tinta">+</b> para crear el primero.</p>
      ) : deDia.length > 0 ? (
        <ul className="mt-4 overflow-hidden rounded-2xl border border-linea bg-carta">
          {deDia.map((h) => <Habito key={h.id} h={h} dia={dia} racha={rachaActual(h, dia)} alAlternar={() => alAlternar(h.id)} alEditar={() => alEditar(h)} />)}
        </ul>
      ) : <p className="mt-6 text-center text-sm text-sec">Este día no tocaba ningún hábito.</p>}

      {otros.length > 0 && (
        <section className="mt-5">
          <button onClick={() => setVerOtros(!verOtros)} aria-expanded={verOtros} className="flex items-center gap-1 px-1 text-[13px] text-sec">
            No toca este día ({otros.length}) <ChevronDown size={14} className={`transition-transform ${verOtros ? 'rotate-180' : ''}`} />
          </button>
          {verOtros && (
            <ul className="mt-2 overflow-hidden rounded-2xl border border-linea bg-carta">
              {otros.map((h) => <Habito key={h.id} h={h} dia={dia} apagado racha={rachaActual(h, dia)} alEditar={() => alEditar(h)} />)}
            </ul>
          )}
        </section>
      )}
    </>
  )
}
