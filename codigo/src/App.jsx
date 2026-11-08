import { useCallback, useEffect, useRef, useState } from 'react'
import { House, ChartColumn, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useHabitos } from './lib/useHabitos'
import { resumenDia } from './lib/habitos'
import { clave, hoy } from './lib/fechas'
import Hoy from './components/Hoy'
import Estadisticas from './components/Estadisticas'
import Formulario from './components/Formulario'

const celebrar = () => {
  const o = { spread: 70, startVelocity: 38, ticks: 160, colors: ['#18181B', '#52525B', '#A1A1AA', '#D4D4D8'], disableForReducedMotion: true }
  confetti({ ...o, particleCount: 80, origin: { x: 0.25, y: 0.75 }, angle: 60 })
  confetti({ ...o, particleCount: 80, origin: { x: 0.75, y: 0.75 }, angle: 120 })
}

export default function App() {
  const { habitos, guardar, borrar, alternar } = useHabitos()
  const [vista, setVista] = useState('hoy')
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo
  const [dia, setDia] = useState(hoy)
  const hoyK = useRef(clave(hoy()))
  const previo = useRef(null)

  // Cambia de día solo si la app queda abierta pasada la medianoche
  useEffect(() => {
    const f = () => { const k = clave(hoy()); if (k !== hoyK.current) { hoyK.current = k; setDia(hoy()) } }
    const t = setInterval(f, 60000)
    document.addEventListener('visibilitychange', f)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', f) }
  }, [])

  // Confeti al pasar a "todo hecho" (no al abrir la app con el día ya completo)
  useEffect(() => {
    const { total, hechos } = resumenDia(habitos, hoy())
    const completo = total > 0 && hechos === total
    if (previo.current === false && completo) celebrar()
    previo.current = completo
  }, [habitos])

  const cerrar = useCallback(() => setEditando(null), [])
  const tab = (on) => `grid h-11 w-13 place-items-center rounded-xl ${on ? 'bg-pista text-tinta' : 'text-sec'}`

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pt-6 pb-32">
      <main>
        {vista === 'hoy'
          ? <Hoy habitos={habitos} dia={dia} setDia={setDia} alAlternar={(id) => alternar(id, dia)} alEditar={setEditando} />
          : <Estadisticas habitos={habitos} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center gap-2.5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <div className="flex gap-1 rounded-2xl border border-linea bg-carta/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur">
          <button className={tab(vista === 'hoy')} onClick={() => setVista('hoy')} aria-label="Hoy" aria-current={vista === 'hoy' ? 'page' : undefined}><House size={21} strokeWidth={1.8} /></button>
          <button className={tab(vista === 'stats')} onClick={() => setVista('stats')} aria-label="Estadísticas" aria-current={vista === 'stats' ? 'page' : undefined}><ChartColumn size={21} strokeWidth={1.8} /></button>
        </div>
        <button onClick={() => setEditando({})} aria-label="Nuevo hábito" className="grid size-[58px] place-items-center rounded-2xl bg-tinta text-white shadow-lg shadow-black/15 active:scale-95">
          <Plus size={24} strokeWidth={2} />
        </button>
      </nav>

      {editando && (
        <Formulario inicial={editando} alCerrar={cerrar}
          alGuardar={(h) => { guardar(h); cerrar() }}
          alBorrar={(id) => { borrar(id); cerrar() }} />
      )}
    </div>
  )
}
