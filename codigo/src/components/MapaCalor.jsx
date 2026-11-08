import { DIAS, clave, sumarDias, hoy } from '../lib/fechas'
import { resumenDia } from '../lib/habitos'

const NIVELES = ['bg-emerald-200 dark:bg-emerald-900', 'bg-emerald-300 dark:bg-emerald-700', 'bg-emerald-500 dark:bg-emerald-500', 'bg-emerald-600 dark:bg-emerald-400']
const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })

// Últimos 30 días en rejilla de semanas (lunes primero), estilo GitHub
export default function MapaCalor({ habitos }) {
  const fin = hoy(), ini = sumarDias(fin, -29)
  const hueco = (ini.getDay() + 6) % 7
  const celdas = [...Array(hueco).fill(null), ...Array.from({ length: 30 }, (_, i) => sumarDias(ini, i))]

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS.map((d) => <span key={d.n} className="text-center text-[11px] font-medium text-zinc-400">{d.corto}</span>)}
        {celdas.map((d, i) => {
          if (!d) return <span key={i} />
          const { total, hechos } = resumenDia(habitos, d)
          const p = total ? hechos / total : 0
          const color = !total || !hechos ? 'bg-zinc-100 dark:bg-zinc-800' : NIVELES[p === 1 ? 3 : p >= 0.66 ? 2 : p >= 0.33 ? 1 : 0]
          const esHoy = clave(d) === clave(fin)
          return (
            <span key={i} title={`${fmt.format(d)}: ${hechos}/${total}`}
              aria-label={`${fmt.format(d)}: ${hechos} de ${total}`}
              className={`grid aspect-square place-items-center rounded-md text-[11px] tabular-nums ${color} ${p >= 0.66 ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-400'} ${esHoy ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900' : ''}`}>
              {d.getDate()}
            </span>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-zinc-400">
        Menos
        {['bg-zinc-100 dark:bg-zinc-800', ...NIVELES].map((c) => <span key={c} className={`size-3 rounded-sm ${c}`} />)}
        Más
      </div>
    </div>
  )
}
