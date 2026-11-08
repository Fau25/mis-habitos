import { DIAS, clave, sumarDias, hoy } from '../lib/fechas'
import { resumenDia } from '../lib/habitos'

const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
// Lima con más o menos intensidad según el % del día
const tono = (p) => (p === 1 ? '#A9C95A' : p >= 0.66 ? '#C8DB8B' : p >= 0.33 ? '#C8DB8BAA' : '#C8DB8B66')

// Últimos 30 días, lunes primero, estilo GitHub
export default function MapaCalor({ habitos }) {
  const fin = hoy(), ini = sumarDias(fin, -29)
  const celdas = [...Array((ini.getDay() + 6) % 7).fill(null), ...Array.from({ length: 30 }, (_, i) => sumarDias(ini, i))]
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS.map((d) => <span key={d.n} className="text-center text-[11px] font-medium text-sec">{d.corto}</span>)}
        {celdas.map((d, i) => {
          if (!d) return <span key={i} />
          const { total, hechos } = resumenDia(habitos, d)
          const p = total ? hechos / total : 0
          return (
            <span key={i} title={`${fmt.format(d)}: ${hechos}/${total}`} aria-label={`${fmt.format(d)}: ${hechos} de ${total}`}
              className={`grid aspect-square place-items-center rounded-lg text-[11px] tabular-nums ${p >= 0.66 ? 'text-[#121211]' : 'text-sec'} ${clave(d) === clave(fin) ? 'ring-2 ring-tinta' : ''}`}
              style={{ background: total && hechos ? tono(p) : 'var(--pista)' }}>
              {d.getDate()}
            </span>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-sec">
        Menos {['var(--pista)', tono(0.1), tono(0.4), tono(0.7), tono(1)].map((c) => <span key={c} className="size-3 rounded-sm" style={{ background: c }} />)} Más
      </div>
    </div>
  )
}
