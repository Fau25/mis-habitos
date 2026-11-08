import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarCheck, BarChart3, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useHabitos } from './lib/useHabitos'
import { resumenDia } from './lib/habitos'
import { clave, hoy } from './lib/fechas'
import Hoy from './components/Hoy'
import Estadisticas from './components/Estadisticas'
import Formulario from './components/Formulario'

const celebrar = () => {
  const o = { spread: 70, startVelocity: 38, ticks: 160, colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'], disableForReducedMotion: true }
  confetti({ ...o, particleCount: 80, origin: { x: 0.25, y: 0.75 }, angle: 60 })
  confetti({ ...o, particleCount: 80, origin: { x: 0.75, y: 0.75 }, angle: 120 })
}

export default function App() {
  const { habitos, guardar, borrar, alternar } = useHabitos()
  const [vista, setVista] = useState('hoy')
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo
  const [dia, setDia] = useState(hoy)
  const previo = useRef(null)

  // Cambia de día solo si la app queda abierta pasada la medianoche
  useEffect(() => {
    const f = () => setDia((d) => (clave(d) === clave(hoy()) ? d : hoy()))
    const t = setInterval(f, 60000)
    document.addEventListener('visibilitychange', f)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', f) }
  }, [])

  // Confeti al pasar a "todo hecho" (no al abrir la app con el día ya completo)
  useEffect(() => {
    const { total, hechos } = resumenDia(habitos, dia)
    const completo = total > 0 && hechos === total
    if (previo.current === false && completo) celebrar()
    previo.current = completo
  }, [habitos, dia])

  const cerrar = useCallback(() => setEditando(null), [])
  const tab = (on) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${on ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28">
      <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between bg-zinc-50/85 px-4 py-3 backdrop-blur dark:bg-[#0b0b0c]/85">
        <h1 className="text-xl font-bold tracking-tight">{vista === 'hoy' ? 'Hoy' : 'Estadísticas'}</h1>
      </header>

      <main>
        {vista === 'hoy'
          ? <Hoy habitos={habitos} dia={dia} alAlternar={(id) => alternar(id, dia)} alEditar={setEditando} alCrear={() => setEditando({})} />
          : <Estadisticas habitos={habitos} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85">
        <div className="mx-auto flex max-w-lg items-center px-6 pb-[max(env(safe-area-inset-bottom),8px)]">
          <button className={tab(vista === 'hoy')} onClick={() => setVista('hoy')} aria-current={vista === 'hoy' ? 'page' : undefined}>
            <CalendarCheck size={22} />Hoy
          </button>
          <button onClick={() => setEditando({})} aria-label="Nuevo hábito"
            className="mx-4 -mt-5 grid size-14 place-items-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-95">
            <Plus size={26} />
          </button>
          <button className={tab(vista === 'stats')} onClick={() => setVista('stats')} aria-current={vista === 'stats' ? 'page' : undefined}>
            <BarChart3 size={22} />Estadísticas
          </button>
        </div>
      </nav>

      {editando && (
        <Formulario inicial={editando} alCerrar={cerrar}
          alGuardar={(h) => { guardar(h); cerrar() }}
          alBorrar={(id) => { borrar(id); cerrar() }} />
      )}
    </div>
  )
}
