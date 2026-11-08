import { Flame, Trophy, Target, CheckCheck } from 'lucide-react'
import { CATEGORIAS, rachaActual, rachaRecord, tocaEl, hecho } from '../lib/habitos'
import { sumarDias, hoy } from '../lib/fechas'
import MapaCalor from './MapaCalor'

const Tarjeta = ({ children, className = '' }) => (
  <section className={`rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>{children}</section>
)

function pct30(h) {
  let t = 0, n = 0
  for (let i = 0; i < 30; i++) { const d = sumarDias(hoy(), -i); if (tocaEl(h, d)) { t++; if (hecho(h, d)) n++ } }
  return t ? Math.round((n / t) * 100) : null
}

export default function Estadisticas({ habitos }) {
  const filas = habitos.map((h) => ({ h, actual: rachaActual(h), record: rachaRecord(h), pct: pct30(h) }))
  const total = habitos.reduce((s, h) => s + Object.keys(h.hechos).length, 0)
  const conPct = filas.filter((f) => f.pct !== null)
  const media = conPct.length ? Math.round(conPct.reduce((s, f) => s + f.pct, 0) / conPct.length) : 0
  const mejor = Math.max(0, ...filas.map((f) => f.record))
  const cifras = [
    { Icono: Target, valor: `${media}%`, texto: 'Constancia 30 días' },
    { Icono: Trophy, valor: mejor, texto: 'Mejor racha' },
    { Icono: CheckCheck, valor: total, texto: 'Veces cumplidos' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {cifras.map(({ Icono, valor, texto }) => (
          <Tarjeta key={texto} className="!p-3">
            <Icono size={16} className="text-zinc-400" />
            <p className="mt-2 text-xl font-semibold tabular-nums">{valor}</p>
            <p className="text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">{texto}</p>
          </Tarjeta>
        ))}
      </div>

      <Tarjeta>
        <h2 className="mb-3 text-sm font-semibold">Últimos 30 días</h2>
        <MapaCalor habitos={habitos} />
      </Tarjeta>

      {filas.length > 0 && (
        <Tarjeta className="!p-0">
          <h2 className="px-4 pt-4 pb-2 text-sm font-semibold">Rachas por hábito</h2>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filas.map(({ h, actual, record, pct }) => {
              const cat = CATEGORIAS[h.categoria] ?? CATEGORIAS.otros
              return (
                <li key={h.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${cat.suave}`}><cat.Icono size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.nombre}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className={`h-full rounded-full ${cat.relleno}`} style={{ width: `${pct ?? 0}%` }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs tabular-nums">
                    <p className="flex items-center justify-end gap-0.5 font-semibold text-orange-600 dark:text-orange-400"><Flame size={12} />{actual}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">récord {record}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Tarjeta>
      )}
    </div>
  )
}
