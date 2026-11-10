import { useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { CATEGORIAS, ORDEN_MOMENTO, tituloDe, tocaEl, hecho, rachaActual, resumenDia } from '../lib/habitos'
import { DIAS, clave, sumarDias, hoy, lunesDe } from '../lib/fechas'
import { IconoHabito } from './Habito'

const fmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const catDe = (h) => (CATEGORIAS[h.categoria] ? h.categoria : 'otros')

function Aro({ p }) {
  const r = 8.75, L = 2 * Math.PI * r
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90" aria-hidden="true">
      <circle cx="10" cy="10" r={r} fill="none" strokeWidth="2.5" stroke="#D4D4D8" />
      {p > 0 && <circle cx="10" cy="10" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-tinta transition-[stroke-dashoffset] duration-300"
        strokeDasharray={L} strokeDashoffset={L * (1 - p)} />}
    </svg>
  )
}

// Un icono: tocar = marcar; en modo edición (o manteniendo pulsado) = editar
function Icono({ h, c, ok, racha, editar, alAlternar, alEditar }) {
  const t = useRef(0), largo = useRef(false)
  const [pop, setPop] = useState(false)
  const empezar = () => { largo.current = false; t.current = setTimeout(() => { largo.current = true; navigator.vibrate?.(10); alEditar() }, 450) }
  const parar = () => clearTimeout(t.current)
  const pulsar = () => { if (largo.current) return; if (editar) return alEditar(); setPop(true); alAlternar() }
  return (
    <li>
      <button onClick={pulsar} onPointerDown={empezar} onPointerUp={parar} onPointerLeave={parar} onPointerCancel={parar}
        onContextMenu={(e) => { e.preventDefault(); parar(); if (!largo.current) alEditar() }} onAnimationEnd={() => setPop(false)}
        aria-pressed={editar ? undefined : ok} aria-label={`${editar ? 'Editar' : ok ? 'Desmarcar' : 'Marcar'} ${h.nombre}`}
        title={`${h.nombre}${h.desc ? ' · ' + h.desc : ''} · racha ${racha}`}
        className="flex w-full flex-col items-center gap-1 select-none [-webkit-touch-callout:none]">
        <span className={`relative grid size-[52px] place-items-center rounded-2xl transition-colors ${pop ? 'pop' : ''}`}
          style={ok ? { background: c.fuerte, color: '#fff' } : { background: '#fff', color: c.fuerte }}>
          <IconoHabito h={h} size={23} />
          {ok && !editar && (
            <span className="absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-white" style={{ color: c.fuerte, boxShadow: `0 0 0 1.5px ${c.fuerte}` }}>
              <Check size={11} strokeWidth={3.2} />
            </span>
          )}
          {editar && <span className="absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-tinta text-white"><Pencil size={10} strokeWidth={2.4} /></span>}
        </span>
        <span className="line-clamp-2 h-[26px] px-0.5 text-center text-[11px] leading-[13px] text-tinta">{h.nombre}</span>
      </button>
    </li>
  )
}

export default function Hoy({ habitos, dia, setDia, alAlternar, alEditar }) {
  const [editar, setEditar] = useState(false)
  const hoyK = clave(hoy()), esHoy = clave(dia) === hoyK
  const lunes = lunesDe(dia)
  const primera = habitos.reduce((m, h) => (h.creado < m ? h.creado : m), hoyK)
  const semana = DIAS.map((_, i) => sumarDias(lunes, i))
  const deDia = habitos.filter((h) => tocaEl(h, dia)).sort((a, b) => ORDEN_MOMENTO[a.momento] - ORDEN_MOMENTO[b.momento])
  const otros = habitos.filter((h) => !tocaEl(h, dia))
  const { total, hechos } = resumenDia(habitos, dia)
  const pct = total ? Math.round((hechos / total) * 100) : 0
  const paneles = Object.keys(CATEGORIAS).map((k) => ({ k, c: CATEGORIAS[k], hs: deDia.filter((h) => catDe(h) === k) })).filter((p) => p.hs.length)

  return (
    <>
      <header>
        <div className="flex items-center justify-between gap-2 px-1">
          <h1 className="min-w-0 truncate text-[22px] font-semibold tracking-tight">
            {esHoy ? 'Hoy' : 'Corrigiendo'} <span className="text-[13px] font-normal text-sec">· {fmt.format(dia)}</span>
          </h1>
          <p className="shrink-0 font-mono text-xs text-sec">{total ? <>{hechos}/{total} · <span className="text-tinta">{pct}%</span></> : 'sin hábitos'}</p>
        </div>

        <div className="mt-2.5 flex items-center gap-0.5">
          <button onClick={() => setDia(sumarDias(lunes, -1))} disabled={clave(lunes) <= primera} aria-label="Semana anterior"
            className="grid h-11 w-6 shrink-0 place-items-center text-sec disabled:opacity-25"><ChevronLeft size={18} /></button>
          <div className="grid flex-1 grid-cols-7 gap-0.5" role="group" aria-label="Días de la semana">
            {semana.map((d, i) => {
              const k = clave(d), futuro = k > hoyK, sel = k === clave(dia), r = resumenDia(habitos, d)
              return (
                <button key={k} disabled={futuro} onClick={() => setDia(d)} aria-pressed={sel}
                  className={`flex flex-col items-center gap-1 rounded-[10px] py-1.5 disabled:opacity-35 ${sel ? 'bg-carta shadow-[0_0_0_1px_var(--color-linea)]' : ''}`}>
                  <span className={`text-[10px] ${sel ? 'font-semibold' : 'text-sec'}`}>{DIAS[i].corto}<span className="sr-only"> {d.getDate()}</span></span>
                  <Aro p={futuro || !r.total ? 0 : r.hechos / r.total} />
                  <span className="sr-only">, {DIAS[i].largo}: {r.hechos} de {r.total}</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => setDia(clave(sumarDias(lunes, 7)) > hoyK ? hoy() : sumarDias(lunes, 7))} disabled={clave(sumarDias(lunes, 6)) >= hoyK} aria-label="Semana siguiente"
            className="grid h-11 w-6 shrink-0 place-items-center text-sec disabled:opacity-25"><ChevronRight size={18} /></button>
        </div>
      </header>

      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        {!esHoy ? <button onClick={() => setDia(hoy())} className="min-h-9 rounded-lg bg-carta px-3 text-[13px] font-medium shadow-[0_0_0_1px_var(--color-linea)]">Volver a hoy</button>
          : <p className="text-[11.5px] text-sec">{editar ? 'Toca un hábito para editarlo' : 'Toca para marcar · mantén pulsado para editar'}</p>}
        {habitos.length > 0 && (
          <button onClick={() => setEditar(!editar)} aria-pressed={editar} className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium ${editar ? 'bg-tinta text-white' : 'text-sec'}`}>
            <Pencil size={14} /> {editar ? 'Listo' : 'Editar'}
          </button>
        )}
      </div>

      {habitos.length === 0 ? (
        <p className="mt-10 text-center text-sec">Aún no tienes hábitos. Pulsa <b className="text-tinta">+</b> para crear el primero.</p>
      ) : paneles.length ? (
        <div className="mt-2 grid grid-flow-dense grid-cols-2 gap-2">
          {paneles.map(({ k, c, hs }) => {
            const ancho = hs.length > 2
            return (
              <section key={k} className={`rounded-[20px] px-1.5 pt-2.5 pb-2 ${ancho ? 'col-span-2' : ''}`} style={{ background: c.suave }} aria-label={c.nombre}>
                <h2 className="mx-2 mb-2 flex justify-between text-xs font-semibold" style={{ color: tituloDe(c) }}>
                  <span>{c.nombre}</span><span className="font-mono font-normal">{hs.filter((h) => hecho(h, dia)).length}/{hs.length}</span>
                </h2>
                <ul className={`grid gap-y-1.5 ${ancho ? 'grid-cols-4' : 'grid-cols-2'}`}>
                  {hs.map((h) => <Icono key={h.id} h={h} c={c} ok={hecho(h, dia)} racha={rachaActual(h, dia)} editar={editar}
                    alAlternar={() => alAlternar(h.id)} alEditar={() => alEditar(h)} />)}
                </ul>
              </section>
            )
          })}
        </div>
      ) : <p className="mt-6 text-center text-sm text-sec">Este día no tocaba ningún hábito.</p>}

      {otros.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 px-1 text-xs text-sec">No toca este día</h2>
          <ul className="flex flex-wrap gap-1.5">
            {otros.map((h) => {
              const c = CATEGORIAS[catDe(h)]
              return (
                <li key={h.id}>
                  <button onClick={() => alEditar(h)} aria-label={`Editar ${h.nombre}`} className="flex min-h-9 items-center gap-1.5 rounded-full bg-carta py-1 pr-3 pl-1.5 text-xs shadow-[0_0_0_1px_var(--color-linea)]">
                    <span className="grid size-6 place-items-center rounded-full" style={{ background: c.suave, color: c.fuerte }}><IconoHabito h={h} size={13} /></span>{h.nombre}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
