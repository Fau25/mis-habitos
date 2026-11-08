import { useEffect, useRef, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { CATEGORIAS, MOMENTOS, ICONOS } from '../lib/habitos'
import { DIAS } from '../lib/fechas'

const Etiqueta = ({ children }) => <span className="mb-1.5 block text-xs font-medium text-sec">{children}</span>
const campo = 'w-full rounded-xl border border-linea bg-fondo px-3.5 py-3 outline-none focus:border-tinta'
const chip = (on) => `rounded-xl px-3 py-2.5 text-sm transition-colors ${on ? 'bg-tinta text-white' : 'bg-pista text-sec'}`

export default function Formulario({ inicial, alGuardar, alBorrar, alCerrar }) {
  const nuevo = !inicial?.id
  const [f, setF] = useState(() => ({ nombre: '', desc: '', categoria: 'salud', frecuencia: 'diario', dias: [1, 2, 3, 4, 5], momento: 'manana', ...inicial }))
  const [confirmar, setConfirmar] = useState(false)
  const ref = useRef(null)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const icono = ICONOS[f.icono] ? f.icono : (CATEGORIAS[f.categoria] ?? CATEGORIAS.otros).icono
  const Icono = ICONOS[icono]

  useEffect(() => {
    const previo = document.activeElement
    ;(nuevo ? ref.current?.querySelector('input') : ref.current)?.focus({ preventScroll: true })
    const esc = (e) => e.key === 'Escape' && alCerrar()
    addEventListener('keydown', esc)
    return () => { removeEventListener('keydown', esc); previo?.focus?.({ preventScroll: true }) }
  }, [alCerrar, nuevo])

  const valido = f.nombre.trim() && (f.frecuencia === 'diario' || f.dias.length)
  const enviar = (e) => { e.preventDefault(); if (valido) alGuardar({ ...f, icono, nombre: f.nombre.trim(), desc: f.desc.trim() }) }
  const alternarDia = (n) => set('dias', f.dias.includes(n) ? f.dias.filter((d) => d !== n) : [...f.dias, n])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center" onClick={alCerrar}>
      <div ref={ref} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby="tit-form"
        className="sube max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-carta p-5 shadow-xl sm:rounded-3xl">
      <form onSubmit={enviar}>
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-pista"><Icono size={20} strokeWidth={1.8} /></span>
          <h2 id="tit-form" className="flex-1 text-lg font-semibold tracking-tight">{nuevo ? 'Nuevo hábito' : 'Editar hábito'}</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="grid size-11 place-items-center rounded-full bg-pista"><X size={17} /></button>
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
                <button type="button" key={k} onClick={() => set('categoria', k)} aria-pressed={f.categoria === k} className={`!text-xs ${chip(f.categoria === k)}`}>{c.nombre}</button>
              ))}
            </div>
          </fieldset>

          <fieldset><legend><Etiqueta>Icono</Etiqueta></legend>
            <div className="grid grid-cols-8 gap-1.5">
              {Object.entries(ICONOS).map(([k, I]) => (
                <button type="button" key={k} onClick={() => set('icono', k)} aria-pressed={icono === k} aria-label={`Icono ${k}`}
                  className={`grid aspect-square place-items-center rounded-xl ${icono === k ? 'bg-tinta text-white' : 'bg-pista text-sec'}`}><I size={18} strokeWidth={1.8} /></button>
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
                    className={`aspect-square !px-0 font-mono ${chip(f.dias.includes(d.n))}`}>{d.corto}</button>
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
              className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium ${confirmar ? 'bg-red-600 text-white' : 'text-red-600'}`}>
              <Trash2 size={16} />{confirmar ? '¿Seguro?' : 'Eliminar'}
            </button>
          )}
          <button type="submit" disabled={!valido} className="flex-1 rounded-xl bg-tinta px-4 py-3 font-medium text-white disabled:opacity-35">
            {nuevo ? 'Crear hábito' : 'Guardar'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}
