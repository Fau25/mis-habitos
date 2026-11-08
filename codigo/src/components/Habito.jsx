import { useState } from 'react'
import { Check, Flame } from 'lucide-react'
import { CATEGORIAS } from '../lib/habitos'

export default function Habito({ h, hecho, racha, alAlternar, alEditar, apagado }) {
  const cat = CATEGORIAS[h.categoria] ?? CATEGORIAS.otros
  const [pop, setPop] = useState(false)
  const pulsar = () => { setPop(true); alAlternar() }
  return (
    <li className={`flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 ${apagado ? 'opacity-60' : ''}`}>
      {!apagado && (
        <button onClick={pulsar} onAnimationEnd={() => setPop(false)} aria-pressed={hecho}
          aria-label={`${hecho ? 'Desmarcar' : 'Marcar'} ${h.nombre}`}
          className={`grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${cat.borde} ${hecho ? cat.relleno + ' text-white' : 'bg-transparent'} ${pop ? 'pop' : ''}`}>
          {hecho && <Check size={17} strokeWidth={3} />}
        </button>
      )}
      <button onClick={alEditar} className="min-w-0 flex-1 text-left" aria-label={`Editar ${h.nombre}`}>
        <span className={`block truncate text-[15px] font-medium ${hecho ? 'text-zinc-400 line-through dark:text-zinc-500' : ''}`}>{h.nombre}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className={`size-1.5 rounded-full ${cat.punto}`} />
          <span className="truncate">{h.desc || cat.nombre}</span>
        </span>
      </button>
      {racha > 0 && (
        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-500/12 px-2 py-0.5 text-xs font-semibold tabular-nums text-orange-700 dark:text-orange-300" title="Racha actual">
          <Flame size={13} />{racha}
        </span>
      )}
    </li>
  )
}
