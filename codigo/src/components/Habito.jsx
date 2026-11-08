import { useState } from 'react'
import { Check } from 'lucide-react'
import { IconoDe, MOMENTOS, frecuenciaTexto, hecho as hechoEl, tocaEl } from '../lib/habitos'
import { sumarDias } from '../lib/fechas'

// Fila compacta: icono, nombre, últimos 7 días en puntos, racha · momento y casilla
export default function Habito({ h, dia, racha, alAlternar, alEditar, apagado }) {
  const Icono = IconoDe(h)
  const ok = !apagado && hechoEl(h, dia)
  const [pop, setPop] = useState(false)
  const puntos = Array.from({ length: 7 }, (_, i) => sumarDias(dia, i - 6))
  return (
    <li className={`flex items-center gap-3 border-t border-linea px-3.5 py-3 first:border-t-0 ${apagado ? 'opacity-50' : ''}`}>
      <button onClick={alEditar} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Editar ${h.nombre}`}>
        <Icono size={18} strokeWidth={1.8} className="shrink-0 text-sec" aria-hidden="true" />
        <span className="min-w-0">
          <span className={`block truncate text-[15px] ${ok ? 'text-sec' : ''}`}>{h.nombre}</span>
          <span className="mt-1.5 flex items-center gap-2">
            <span className="flex gap-[3px]" aria-hidden="true">
              {puntos.map((d, i) => (
                <span key={i} className={`size-1.5 rounded-[2px] ${hechoEl(h, d) ? 'bg-tinta' : tocaEl(h, d) ? 'bg-medio/45' : 'bg-pista'}`} />
              ))}
            </span>
            <span className="truncate font-mono text-[11px] text-sec">{racha}d · {apagado ? frecuenciaTexto(h) : MOMENTOS[h.momento]?.corto}</span>
          </span>
        </span>
      </button>
      {!apagado && (
        <button onClick={() => { setPop(true); alAlternar() }} onAnimationEnd={() => setPop(false)} aria-pressed={ok}
          aria-label={`${ok ? 'Desmarcar' : 'Marcar'} ${h.nombre}`}
          className={`grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors ${ok ? 'bg-tinta text-white' : 'border-[1.5px] border-medio/70'} ${pop ? 'pop' : ''}`}>
          {ok && <Check size={18} strokeWidth={2.6} />}
        </button>
      )}
    </li>
  )
}
