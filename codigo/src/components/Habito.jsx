import { useState } from 'react'
import { Check, Flame } from 'lucide-react'
import { colorDe, emojiDe, frecuenciaTexto, suave } from '../lib/habitos'

export default function Habito({ h, hecho, racha, alAlternar, alEditar, apagado }) {
  const c = colorDe(h)
  const [pop, setPop] = useState(false)
  return (
    <li className={`flex items-center gap-3 rounded-2xl bg-carta p-3 ${apagado ? 'opacity-55' : ''}`}>
      <button onClick={alEditar} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Editar ${h.nombre}`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full text-[22px]" style={{ background: suave(c) }}>{emojiDe(h)}</span>
        <span className="min-w-0">
          <span className={`block truncate text-[15px] font-medium ${hecho ? 'text-sec line-through' : ''}`}>{h.nombre}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-sec">
            <span className="truncate">{h.desc || frecuenciaTexto(h)}</span>
            {racha > 0 && <span className="flex shrink-0 items-center gap-0.5 font-semibold text-tinta"><Flame size={12} className="text-orange-500" />{racha}</span>}
          </span>
        </span>
      </button>
      {!apagado && (
        <button onClick={() => { setPop(true); alAlternar() }} onAnimationEnd={() => setPop(false)} aria-pressed={hecho}
          aria-label={`${hecho ? 'Desmarcar' : 'Marcar'} ${h.nombre}`}
          className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors ${pop ? 'pop' : ''}`}
          style={hecho ? { background: c, color: '#121211' } : { background: suave(c, '33'), boxShadow: `inset 0 0 0 2px ${suave(c, '99')}` }}>
          {hecho && <Check size={19} strokeWidth={2.6} />}
        </button>
      )}
    </li>
  )
}
