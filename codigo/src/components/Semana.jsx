// Solo en escritorio: cada hábito por días de esta semana, para marcar o corregir de un clic
import { cat, hecho, tocaEl } from '../lib/habitos'
import { DIAS, clave, sumarDias, hoy, lunesDe } from '../lib/fechas'

export default function Semana({ habitos, alternar }) {
  const lunes = lunesDe(hoy()), hoyK = clave(hoy())
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  if (!habitos.length) return null
  return (
    <section className="rounded-2xl border border-linea bg-carta p-4" aria-label="Esta semana">
      <div className="grid grid-cols-[minmax(0,1fr)_repeat(7,32px)] items-center gap-1.5 text-[11px] text-sec">
        <h2 className="text-[15px] font-semibold text-tinta">Esta semana</h2>
        {dias.map((d, i) => <span key={i} className={`text-center ${clave(d) === hoyK ? 'font-semibold text-tinta' : ''}`}>{DIAS[i].corto}</span>)}
      </div>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {habitos.map((h) => (
          <div key={h.id} className="grid grid-cols-[minmax(0,1fr)_repeat(7,32px)] items-center gap-1.5">
            <span className="truncate text-[13px]">{h.nombre}</span>
            {dias.map((d, i) => {
              const k = clave(d), futuro = k > hoyK, toca = tocaEl(h, d), si = hecho(h, d)
              if (futuro || !toca) return <span key={i} className={`h-6 rounded-md ${futuro ? 'border border-dashed border-linea' : 'bg-transparent'}`} aria-hidden="true" />
              return <button key={i} onClick={() => alternar(h.id, d)} title={`${h.nombre} · ${DIAS[i].largo}`}
                aria-label={`${h.nombre}, ${DIAS[i].largo}: ${si ? 'hecho' : 'sin hacer'}`} aria-pressed={si}
                className="h-6 cursor-pointer rounded-md transition-opacity hover:opacity-80" style={{ background: si ? cat(h).fuerte : '#EEEEEC' }} />
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-sec">Clic en un día para marcarlo o corregirlo.</p>
    </section>
  )
}
