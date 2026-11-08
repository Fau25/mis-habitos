import { useState } from 'react'
import { ChevronDown, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { MOMENTOS, tocaEl, hecho, rachaActual, puntuacion } from '../lib/habitos'
import { fechaLarga, sumarDias } from '../lib/fechas'
import Anillo from './Anillo'
import Habito from './Habito'

const coma = (x) => x.toFixed(1).replace('.', ',')

export default function Hoy({ habitos, dia, alAlternar, alEditar, alCrear }) {
  const [verOtros, setVerOtros] = useState(false)
  const deHoy = habitos.filter((h) => tocaEl(h, dia))
  const otros = habitos.filter((h) => !tocaEl(h, dia))
  const nHechos = deHoy.filter((h) => hecho(h, dia)).length
  const nota = puntuacion(habitos, dia)
  const ayer = puntuacion(habitos, sumarDias(dia, -1))
  const cambio = nota !== null && ayer ? Math.round(((nota - ayer) / ayer) * 100) : null
  const completo = deHoy.length > 0 && nHechos === deHoy.length

  return (
    <>
      <p className="-mt-2 mb-2 text-center text-sm text-sec first-letter:uppercase">{fechaLarga(dia)}</p>
      <Anillo habitos={deHoy} dia={dia}>
        <div className="text-center">
          <p className="text-6xl font-semibold tracking-tighter tabular-nums">{nota === null ? '–' : coma(nota)}</p>
          <p className="mx-auto mt-1 max-w-[150px] text-xs leading-snug text-sec">
            {deHoy.length === 0 ? 'Hoy no tienes hábitos' : completo ? <>¡Todos tus <b className="text-tinta">hábitos de hoy</b> están hechos!</> : <>Tus <b className="text-tinta">hábitos de hoy</b> no están completos · {nHechos}/{deHoy.length}</>}
          </p>
        </div>
      </Anillo>

      <div className="mt-2 flex justify-center">
        <button onClick={alCrear} className="flex items-center gap-1.5 rounded-full bg-tinta px-5 py-2.5 text-sm font-medium text-fondo">
          <Plus size={16} /> Añadir hábito
        </button>
      </div>

      {cambio !== null && cambio !== 0 && (
        <div className={`mt-5 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium ${cambio < 0 ? 'bg-[#F2A9D3]/30' : 'bg-[#C8DB8B]/35'}`}>
          {cambio < 0 ? <TrendingDown size={20} className="shrink-0 text-red-500" /> : <TrendingUp size={20} className="shrink-0 text-emerald-600" />}
          <p>Tu puntuación ha {cambio < 0 ? 'bajado' : 'subido'} <span className={cambio < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>{Math.abs(cambio)} %</span> respecto a ayer.</p>
        </div>
      )}

      {Object.entries(MOMENTOS).map(([k, m]) => {
        const lista = deHoy.filter((h) => h.momento === k).sort((a, b) => hecho(a, dia) - hecho(b, dia))
        if (!lista.length) return null
        return (
          <section key={k} className="mt-6">
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold"><m.Icono size={15} className="text-sec" /> {m.nombre}</h2>
            <ul className="space-y-2">
              {lista.map((h) => <Habito key={h.id} h={h} hecho={hecho(h, dia)} racha={rachaActual(h)} alAlternar={() => alAlternar(h.id)} alEditar={() => alEditar(h)} />)}
            </ul>
          </section>
        )
      })}

      {otros.length > 0 && (
        <section className="mt-6">
          <button onClick={() => setVerOtros(!verOtros)} aria-expanded={verOtros} className="flex items-center gap-1 px-1 text-sm font-semibold text-sec">
            Hoy no toca ({otros.length}) <ChevronDown size={15} className={`transition-transform ${verOtros ? 'rotate-180' : ''}`} />
          </button>
          {verOtros && <ul className="mt-2 space-y-2">{otros.map((h) => <Habito key={h.id} h={h} apagado racha={rachaActual(h)} alEditar={() => alEditar(h)} />)}</ul>}
        </section>
      )}
    </>
  )
}
