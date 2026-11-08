import { useCallback, useEffect, useRef, useState } from 'react'
import { House, ChartColumn, Settings, Plus, TriangleAlert } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useHabitos } from './lib/useHabitos'
import { resumenDia } from './lib/habitos'
import { clave, hoy } from './lib/fechas'
import Hoy from './components/Hoy'
import Estadisticas from './components/Estadisticas'
import Ajustes from './components/Ajustes'
import Formulario from './components/Formulario'

const celebrar = () => {
  const o = { spread: 70, startVelocity: 38, ticks: 160, colors: ['#18181B', '#52525B', '#A1A1AA', '#D4D4D8'], disableForReducedMotion: true }
  confetti({ ...o, particleCount: 80, origin: { x: 0.25, y: 0.75 }, angle: 60 })
  confetti({ ...o, particleCount: 80, origin: { x: 0.75, y: 0.75 }, angle: 120 })
}

const AVISOS = {
  danado: 'Los datos guardados estaban dañados y no se han podido leer. Están apartados sin tocar; si tienes una copia, impórtala en Ajustes.',
  sinAlmacen: 'Este navegador no deja guardar datos: lo que hagas se perderá al cerrar. Ábrela en Safari normal (no privado).',
}

export default function App() {
  const { habitos, estado, guardar, borrar, alternar, reemplazar } = useHabitos()
  const [vista, setVista] = useState('hoy')
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo
  const [dia, setDia] = useState(hoy)
  const [aviso, setAviso] = useState(null) // { texto, deshacer? }
  const hoyK = useRef(clave(hoy()))
  const previo = useRef(null)
  const tAviso = useRef(0)

  const avisar = useCallback((texto, deshacer) => {
    clearTimeout(tAviso.current); setAviso({ texto, deshacer })
    tAviso.current = setTimeout(() => setAviso(null), deshacer ? 6000 : 3000)
  }, [])

  // Cambia de día solo si la app queda abierta pasada la medianoche
  useEffect(() => {
    const f = () => { const k = clave(hoy()); if (k !== hoyK.current) { hoyK.current = k; setDia(hoy()) } }
    const t = setInterval(f, 60000)
    document.addEventListener('visibilitychange', f)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', f) }
  }, [])

  // Confeti al pasar a "todo hecho" hoy (no al abrir la app con el día ya completo)
  useEffect(() => {
    const { total, hechos } = resumenDia(habitos, hoy())
    const completo = total > 0 && hechos === total
    if (previo.current === false && completo) celebrar()
    previo.current = completo
  }, [habitos])

  const cerrar = useCallback(() => setEditando(null), [])
  const tab = (on) => `grid size-11 place-items-center rounded-xl ${on ? 'bg-pista text-tinta' : 'text-sec'}`
  const abierto = !!editando

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pt-6 pb-32">
      <main inert={abierto || undefined}>
        {AVISOS[estado] && (
          <p role="alert" className="mb-4 flex gap-2.5 rounded-2xl border border-tinta bg-carta p-3.5 text-sm">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{AVISOS[estado]}
          </p>
        )}
        {vista === 'hoy' ? <Hoy habitos={habitos} dia={dia} setDia={setDia} alAlternar={(id) => alternar(id, dia)} alEditar={setEditando} />
          : vista === 'stats' ? <Estadisticas habitos={habitos} />
          : <Ajustes habitos={habitos} reemplazar={reemplazar} avisar={avisar} />}
      </main>

      <nav inert={abierto || undefined} className="fixed inset-x-0 bottom-0 z-20 flex justify-center gap-2.5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <div className="flex gap-1 rounded-2xl border border-linea bg-carta/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur">
          {[['hoy', 'Hoy', House], ['stats', 'Estadísticas', ChartColumn], ['ajustes', 'Ajustes', Settings]].map(([k, l, I]) => (
            <button key={k} className={tab(vista === k)} onClick={() => setVista(k)} aria-label={l} aria-current={vista === k ? 'page' : undefined}><I size={21} strokeWidth={1.8} /></button>
          ))}
        </div>
        <button onClick={() => setEditando({})} aria-label="Nuevo hábito" className="grid size-[58px] place-items-center rounded-2xl bg-tinta text-white shadow-lg shadow-black/15 active:scale-95">
          <Plus size={24} strokeWidth={2} />
        </button>
      </nav>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[104px] z-30 flex justify-center px-4">
        {aviso && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-tinta py-1.5 pr-1.5 pl-4 text-sm text-white shadow-lg">
            <span className="py-1.5">{aviso.texto}</span>
            {aviso.deshacer && <button onClick={() => { aviso.deshacer(); setAviso(null) }} className="min-h-9 rounded-lg bg-white/15 px-3 font-medium">Deshacer</button>}
          </div>
        )}
      </div>

      {editando && (
        <Formulario inicial={editando} alCerrar={cerrar}
          alGuardar={(h) => { guardar(h); cerrar() }}
          alBorrar={(id) => { const deshacer = borrar(id); cerrar(); avisar(`«${editando.nombre}» eliminado`, deshacer) }} />
      )}
    </div>
  )
}
