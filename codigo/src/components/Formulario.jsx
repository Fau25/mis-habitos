import { useEffect, useRef, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { CATEGORIAS, MOMENTOS, EMOJIS, suave } from '../lib/habitos'
import { DIAS } from '../lib/fechas'

const Etiqueta = ({ children }) => <span className="mb-1.5 block text-xs font-semibold text-sec">{children}</span>
const campo = 'w-full rounded-xl border border-linea bg-fondo px-3.5 py-3 outline-none focus:border-tinta'
const chip = (on) => `rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${on ? 'bg-tinta text-fondo' : 'bg-pista text-sec'}`

export default function Formulario({ inicial, alGuardar, alBorrar, alCerrar }) {
  const nuevo = !inicial?.id
  const [f, setF] = useState(() => ({ nombre: '', desc: '', categoria: 'salud', frecuencia: 'diario', dias: [1, 2, 3, 4, 5], momento: 'manana', ...inicial }))
  const [confirmar, setConfirmar] = useState(false)
  const ref = useRef(null)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const color = (CATEGORIAS[f.categoria] ?? CATEGORIAS.otros).color
  const emoji = f.emoji || (CATEGORIAS[f.categoria] ?? CATEGORIAS.otros).emoji

  useEffect(() => {
    if (nuevo) ref.current?.querySelector('input')?.focus({ preventScroll: true })
    const esc = (e) => e.key === 'Escape' && alCerrar()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [alCerrar, nuevo])

  const valido = f.nombre.trim() && (f.frecuencia === 'diario' || f.dias.length)
  const enviar = (e) => { e.preventDefault(); if (valido) alGuardar({ ...f, emoji, nombre: f.nombre.trim(), desc: f.desc.trim() }) }
  const alternarDia = (n) => set('dias', f.dias.includes(n) ? f.dias.filter((d) => d !== n) : [...f.dias, n])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={alCerrar}>
      <form ref={ref} onSubmit={enviar} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="tit-form"
        className="sube max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-carta p-5 shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full text-2xl" style={{ background: suave(color) }}>{emoji}</span>
          <h2 id="tit-form" className="flex-1 text-lg font-semibold">{nuevo ? 'Nuevo hábito' : 'Editar hábito'}</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="grid size-9 place-items-center rounded-full bg-pista"><X size={17} /></button>
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
                  className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-shadow"
                  style={{ background: suave(c.color, f.categoria === k ? 'FF' : '40'), color: f.categoria === k ? '#121211' : undefined, boxShadow: f.categoria === k ? 'inset 0 0 0 2px #12121133' : undefined }}>
                  {c.nombre}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset><legend><Etiqueta>Icono</Etiqueta></legend>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => set('emoji', e)} aria-pressed={emoji === e} aria-label={`Icono ${e}`}
                  className="grid aspect-square place-items-center rounded-xl text-xl" style={{ background: emoji === e ? suave(color, 'AA') : 'var(--pista)' }}>{e}</button>
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
                    className={`aspect-square !rounded-full !px-0 ${chip(f.dias.includes(d.n))}`}>{d.corto}</button>
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
              className={`flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium ${confirmar ? 'bg-red-600 text-white' : 'text-red-600 dark:text-red-400'}`}>
              <Trash2 size={16} />{confirmar ? '¿Seguro?' : 'Eliminar'}
            </button>
          )}
          <button type="submit" disabled={!valido} className="flex-1 rounded-full bg-tinta px-4 py-3 font-semibold text-fondo disabled:opacity-35">
            {nuevo ? 'Crear hábito' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
