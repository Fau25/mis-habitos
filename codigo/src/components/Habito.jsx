import { useState } from 'react'
import { Check } from 'lucide-react'
import { ICONOS, nombreIcono, MOMENTOS, frecuenciaTexto, hecho as hechoEl, tocaEl } from '../lib/habitos'
import { sumarDias } from '../lib/fechas'

export const IconoHabito = ({ h, ...p }) => { const I = ICONOS[nombreIcono(h)]; return <I strokeWidth={1.8} aria-hidden="true" {...p} /> }

// Fila compacta: icono, nombre (+ descripción), últimos 7 días, racha · momento y casilla
export default function Habito({ h, dia, racha, alAlternar, alEditar, apagado }) {
  const ok = !apagado && hechoEl(h, dia)
  const [pop, setPop] = useState(false)
  const puntos = Array.from({ length: 7 }, (_, i) => sumarDias(dia, i - 6))
  return (
    <li className={`flex items-center gap-3 border-t border-linea py-2.5 pr-2 pl-3.5 first:border-t-0 ${apagado ? 'opacity-55' : ''}`}>
      <button onClick={alEditar} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <IconoHabito h={h} size={18} className="shrink-0 text-sec" />
        <span className="min-w-0">
          <span className={`block truncate text-[15px] ${ok ? 'text-sec' : ''}`}>{h.nombre}</span>
          {h.desc && <span className="block truncate text-xs text-sec">{h.desc}</span>}
          <span className="mt-1.5 flex items-center gap-2">
            <span className="flex gap-[3px]" aria-hidden="true">
              {puntos.map((d, i) => hechoEl(h, d)
                ? <span key={i} className="size-1.5 rounded-[2px] bg-tinta" />
                : tocaEl(h, d) ? <span key={i} className="size-1.5 rounded-[2px] border border-[#8E8E96]" />
                : <span key={i} className="size-1.5 rounded-[2px] bg-pista" />)}
            </span>
            <span className="truncate font-mono text-[11px] text-sec">{racha}d · {apagado ? frecuenciaTexto(h) : MOMENTOS[h.momento]?.corto}</span>
          </span>
          <span className="sr-only">, editar</span>
        </span>
      </button>
      {!apagado && (
        <button onClick={() => { setPop(true); alAlternar() }} onAnimationEnd={() => setPop(false)} aria-pressed={ok}
          aria-label={`${ok ? 'Desmarcar' : 'Marcar'} ${h.nombre}`} className="grid size-11 shrink-0 place-items-center">
          <span className={`grid size-9 place-items-center rounded-[10px] transition-colors ${ok ? 'bg-tinta text-white' : 'border-[1.5px] border-[#8E8E96]'} ${pop ? 'pop' : ''}`}>
            {ok && <Check size={18} strokeWidth={2.6} />}
          </span>
        </button>
      )}
    </li>
  )
}
