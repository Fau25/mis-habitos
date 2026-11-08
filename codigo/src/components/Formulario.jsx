import { useEffect, useRef, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { CATEGORIAS, MOMENTOS } from '../lib/habitos'
import { DIAS } from '../lib/fechas'

const Etiqueta = ({ children }) => <span className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">{children}</span>
const campo = 'w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800'
const chip = (on) => `rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${on ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900' : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300'}`

export default function Formulario({ inicial, alGuardar, alBorrar, alCerrar }) {
  const nuevo = !inicial?.id
  const [f, setF] = useState(() => ({ nombre: '', desc: '', categoria: 'salud', frecuencia: 'diario', dias: [1, 2, 3, 4, 5], momento: 'manana', ...inicial }))
  const [confirmar, setConfirmar] = useState(false)
  const ref = useRef(null)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  useEffect(() => {
    if (nuevo) ref.current?.querySelector('input')?.focus({ preventScroll: true })
    const esc = (e) => e.key === 'Escape' && alCerrar()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [alCerrar, nuevo])

  const valido = f.nombre.trim() && (f.frecuencia === 'diario' || f.dias.length)
  const enviar = (e) => {
    e.preventDefault()
    if (valido) alGuardar({ ...f, nombre: f.nombre.trim(), desc: f.desc.trim() })
  }
  const alternarDia = (n) => set('dias', f.dias.includes(n) ? f.dias.filter((d) => d !== n) : [...f.dias, n])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={alCerrar}>
      <form ref={ref} onSubmit={enviar} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="tit-form"
        className="sube max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="tit-form" className="text-lg font-semibold">{nuevo ? 'Nuevo hábito' : 'Editar hábito'}</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="grid size-8 place-items-center rounded-full bg-zinc-100 dark:bg-zinc-800"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <label className="block"><Etiqueta>Nombre</Etiqueta>
            <input className={campo} value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej.: Meditar 10 minutos" maxLength={60} enterKeyHint="done" />
          </label>
          <label className="block"><Etiqueta>Descripción corta (opcional)</Etiqueta>
            <input className={campo} value={f.desc} onChange={(e) => set('desc', e.target.value)} placeholder="Por qué o cómo" maxLength={80} />
          </label>

          <fieldset><legend><Etiqueta>Categoría</Etiqueta></legend>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORIAS).map(([k, c]) => (
                <button type="button" key={k} onClick={() => set('categoria', k)} aria-pressed={f.categoria === k}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${f.categoria === k ? `${c.borde} ${c.suave}` : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300'}`}>
                  <c.Icono size={18} />{c.nombre}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset><legend><Etiqueta>Frecuencia</Etiqueta></legend>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={chip(f.frecuencia === 'diario')} aria-pressed={f.frecuencia === 'diario'} onClick={() => set('frecuencia', 'diario')}>Cada día</button>
              <button type="button" className={chip(f.frecuencia === 'dias')} aria-pressed={f.frecuencia === 'dias'} onClick={() => set('frecuencia', 'dias')}>Días concretos</button>
            </div>
            {f.frecuencia === 'dias' && (
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {DIAS.map((d) => (
                  <button type="button" key={d.n} onClick={() => alternarDia(d.n)} aria-pressed={f.dias.includes(d.n)} aria-label={d.largo}
                    className={`aspect-square rounded-lg text-sm font-semibold ${chip(f.dias.includes(d.n))} !px-0`}>{d.corto}</button>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset><legend><Etiqueta>Momento del día</Etiqueta></legend>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(MOMENTOS).map(([k, m]) => (
                <button type="button" key={k} className={`flex items-center justify-center gap-1.5 ${chip(f.momento === k)}`} aria-pressed={f.momento === k} onClick={() => set('momento', k)}>
                  <m.Icono size={15} />{m.nombre}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex gap-2">
          {!nuevo && (
            <button type="button" onClick={() => (confirmar ? alBorrar(f.id) : setConfirmar(true))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium ${confirmar ? 'bg-red-600 text-white' : 'text-red-600 dark:text-red-400'}`}>
              <Trash2 size={16} />{confirmar ? '¿Seguro?' : 'Eliminar'}
            </button>
          )}
          <button type="submit" disabled={!valido}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:opacity-40">
            {nuevo ? 'Crear hábito' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
