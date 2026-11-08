import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { colorDe, emojiDe, frecuenciaTexto, suave, tocaEl, hecho, porcentaje, rachaActual, rachaRecord, rachasGenerales } from '../lib/habitos'
import { DIAS, clave, sumarDias, hoy } from '../lib/fechas'
import MapaCalor from './MapaCalor'

const Carta = ({ children, className = '' }) => <section className={`rounded-2xl bg-carta p-4 ${className}`}>{children}</section>
const Cabecera = ({ h }) => (
  <div className="mb-3 flex items-center gap-2 border-b border-linea pb-2.5">
    <span className="text-lg">{emojiDe(h)}</span>
    <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{h.nombre}</span>
    <span className="shrink-0 text-sm text-sec">{frecuenciaTexto(h)}</span>
  </div>
)
const lunesDe = (d) => sumarDias(d, -((d.getDay() + 6) % 7))
const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })

function Resumen({ habitos }) {
  const filas = habitos.map((h) => ({ h, p: porcentaje(h, 30) ?? 0 }))
  return (
    <div className="space-y-4">
      {filas.length > 0 && (
        <Carta>
          <h2 className="mb-1 font-semibold">Resumen</h2>
          <p className="mb-4 text-xs text-sec">Días cumplidos de cada hábito en los últimos 30 días</p>
          <div className="flex h-44 items-end gap-2.5">
            {filas.map(({ h, p }) => (
              <div key={h.id} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5" title={`${h.nombre}: ${p} %`}>
                <span className="text-[11px] font-semibold tabular-nums">{p}%</span>
                <div className="relative w-full max-w-12 flex-1 overflow-hidden rounded-xl bg-pista">
                  <div className="absolute inset-x-0 bottom-0 rounded-xl transition-[height] duration-500" style={{ height: `${p}%`, background: colorDe(h) }} />
                </div>
                <span className="text-lg" aria-hidden="true">{emojiDe(h)}</span>
              </div>
            ))}
          </div>
        </Carta>
      )}
      <Carta>
        <h2 className="mb-3 font-semibold">Últimos 30 días</h2>
        <MapaCalor habitos={habitos} />
      </Carta>
    </div>
  )
}

function Semana({ habitos, alAlternar }) {
  const [desp, setDesp] = useState(0)
  const lunes = sumarDias(lunesDe(hoy()), desp * 7)
  const dias = DIAS.map((_, i) => sumarDias(lunes, i))
  const hoyK = clave(hoy())
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <button onClick={() => setDesp(desp - 1)} aria-label="Semana anterior" className="grid size-9 place-items-center rounded-full bg-carta"><ChevronLeft size={18} /></button>
        <span className="text-sm font-medium">{desp === 0 ? 'Esta semana' : `${fmt.format(dias[0])} – ${fmt.format(dias[6])}`}</span>
        <button onClick={() => setDesp(desp + 1)} disabled={desp >= 0} aria-label="Semana siguiente" className="grid size-9 place-items-center rounded-full bg-carta disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>
      {habitos.map((h) => {
        const c = colorDe(h)
        return (
          <Carta key={h.id}>
            <Cabecera h={h} />
            <div className="grid grid-cols-7 gap-1 text-center">
              {dias.map((d, i) => {
                const k = clave(d), toca = tocaEl(h, d), hoyOAntes = k <= hoyK, ok = hecho(h, d)
                const activo = toca && hoyOAntes
                return (
                  <div key={k} className="flex flex-col items-center gap-1.5">
                    <span className={`text-xs ${k === hoyK ? 'font-semibold' : 'text-sec'}`}>{DIAS[i].corto}</span>
                    <button disabled={!activo} onClick={() => alAlternar(h.id, d)} aria-pressed={ok}
                      aria-label={`${h.nombre}, ${DIAS[i].largo} ${d.getDate()}: ${ok ? 'hecho' : toca ? 'sin hacer' : 'no toca'}`}
                      className="grid size-9 place-items-center rounded-full transition-colors"
                      style={{ background: ok ? c : toca ? suave(c, hoyOAntes ? '40' : '1F') : 'var(--pista)', opacity: toca ? 1 : 0.5 }}>
                      {ok && <Check size={17} strokeWidth={2.6} color="#121211" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </Carta>
        )
      })}
    </div>
  )
}

const SEMANAS = 20
function General({ habitos }) {
  const { actual, record } = rachasGenerales(habitos)
  let toca = 0, ok = 0
  for (const h of habitos) {
    for (let d = new Date(h.creado + 'T00:00'), fin = hoy(); d <= fin; d = sumarDias(d, 1)) if (tocaEl(h, d)) { toca++; if (hecho(h, d)) ok++ }
  }
  const total = habitos.reduce((s, h) => s + Object.keys(h.hechos).length, 0)
  const cifras = [
    ['Racha actual', `${actual} ${actual === 1 ? 'día' : 'días'}`], ['Tasa de éxito', toca ? `${Math.round((ok / toca) * 100)} %` : '–'],
    ['Mejor racha', `${record} ${record === 1 ? 'día' : 'días'}`], ['Hábitos completados', total],
  ]
  const ini = sumarDias(lunesDe(hoy()), -(SEMANAS - 1) * 7), hoyK = clave(hoy())
  return (
    <div className="space-y-3">
      <h2 className="px-1 font-semibold">Resumen</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {cifras.map(([t, v]) => (
          <Carta key={t} className="!px-4 !py-3"><p className="text-xs text-sec">{t}</p><p className="mt-0.5 font-semibold tabular-nums">{v}</p></Carta>
        ))}
      </div>
      <p className="px-1 pt-1 text-xs text-sec">La racha general cuenta los días con todos los hábitos hechos. Abajo, las últimas {SEMANAS} semanas de cada hábito.</p>
      {habitos.map((h) => {
        const c = colorDe(h)
        return (
          <Carta key={h.id}>
            <Cabecera h={h} />
            <div className="flex gap-1.5">
              <div className="flex flex-col justify-between py-px text-[9px] leading-none text-sec">{DIAS.map((d) => <span key={d.n}>{d.corto}</span>)}</div>
              <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]" role="img" aria-label={`${h.nombre}: ${porcentaje(h, SEMANAS * 7) ?? 0} % cumplido`}>
                {Array.from({ length: SEMANAS * 7 }, (_, i) => {
                  const d = sumarDias(ini, i), k = clave(d)
                  const bg = k > hoyK ? 'transparent' : hecho(h, d) ? c : tocaEl(h, d) ? suave(c, '38') : 'var(--pista)'
                  return <span key={k} className="aspect-square rounded-[3px]" style={{ background: bg }} />
                })}
              </div>
            </div>
            <p className="mt-2.5 flex gap-4 text-xs text-sec">
              <span>Racha <b className="text-tinta">{rachaActual(h)}</b></span><span>Récord <b className="text-tinta">{rachaRecord(h)}</b></span>
            </p>
          </Carta>
        )
      })}
    </div>
  )
}

const PESTANAS = [['resumen', 'Hoy'], ['semana', 'Semana'], ['general', 'General']]
export default function Estadisticas({ habitos, alAlternar }) {
  const [p, setP] = useState('resumen')
  return (
    <>
      <div className="mb-4 grid grid-cols-3 rounded-xl bg-pista p-1" role="tablist">
        {PESTANAS.map(([k, t]) => (
          <button key={k} role="tab" aria-selected={p === k} onClick={() => setP(k)}
            className={`rounded-lg py-2 text-sm font-medium ${p === k ? 'bg-tinta text-fondo' : 'text-sec'}`}>{t}</button>
        ))}
      </div>
      {habitos.length === 0 ? <p className="py-10 text-center text-sec">Aún no hay hábitos.</p>
        : p === 'resumen' ? <Resumen habitos={habitos} /> : p === 'semana' ? <Semana habitos={habitos} alAlternar={alAlternar} /> : <General habitos={habitos} />}
    </>
  )
}
