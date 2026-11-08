import { useState } from 'react'
import { ChevronDown, ListPlus } from 'lucide-react'
import { MOMENTOS, tocaEl, hecho, rachaActual } from '../lib/habitos'
import { fechaLarga } from '../lib/fechas'
import Progreso from './Progreso'
import Habito from './Habito'

export default function Hoy({ habitos, dia, alAlternar, alEditar, alCrear }) {
  const [verOtros, setVerOtros] = useState(false)
  const deHoy = habitos.filter((h) => tocaEl(h, dia))
  const otros = habitos.filter((h) => !tocaEl(h, dia))
  const nHechos = deHoy.filter((h) => hecho(h, dia)).length
  const pendientes = deHoy.length - nHechos

  return (
    <>
      <section className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Progreso hechos={nHechos} total={deHoy.length} />
        <div className="min-w-0">
          <p className="text-sm text-zinc-500 first-letter:uppercase dark:text-zinc-400">{fechaLarga(dia)}</p>
          <p className="mt-0.5 text-lg font-semibold">
            {deHoy.length === 0 ? 'Nada para hoy' : pendientes === 0 ? '¡Día completado!' : `${pendientes} pendiente${pendientes > 1 ? 's' : ''}`}
          </p>
          <p className="text-sm text-zinc-500 tabular-nums dark:text-zinc-400">{nHechos} de {deHoy.length} hechos</p>
        </div>
      </section>

      {habitos.length === 0 && (
        <button onClick={alCrear} className="mt-6 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 p-8 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          <ListPlus size={28} />
          <span className="font-medium">Crea tu primer hábito</span>
        </button>
      )}

      {Object.entries(MOMENTOS).map(([k, m]) => {
        const lista = deHoy.filter((h) => h.momento === k)
          .sort((a, b) => hecho(a, dia) - hecho(b, dia))
        if (!lista.length) return null
        return (
          <section key={k} className="mt-6">
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <m.Icono size={14} /> {m.nombre}
            </h2>
            <ul className="space-y-2">
              {lista.map((h) => (
                <Habito key={h.id} h={h} hecho={hecho(h, dia)} racha={rachaActual(h)}
                  alAlternar={() => alAlternar(h.id)} alEditar={() => alEditar(h)} />
              ))}
            </ul>
          </section>
        )
      })}

      {otros.length > 0 && (
        <section className="mt-6">
          <button onClick={() => setVerOtros(!verOtros)} aria-expanded={verOtros}
            className="flex w-full items-center gap-1 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Hoy no toca ({otros.length})
            <ChevronDown size={14} className={`transition-transform ${verOtros ? 'rotate-180' : ''}`} />
          </button>
          {verOtros && (
            <ul className="mt-2 space-y-2">
              {otros.map((h) => <Habito key={h.id} h={h} apagado racha={rachaActual(h)} alEditar={() => alEditar(h)} />)}
            </ul>
          )}
        </section>
      )}
    </>
  )
}
