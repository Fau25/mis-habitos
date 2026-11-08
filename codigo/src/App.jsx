import { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutGrid, ChartColumn, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useHabitos } from './lib/useHabitos'
import { resumenDia } from './lib/habitos'
import { clave, hoy } from './lib/fechas'
import Hoy from './components/Hoy'
import Estadisticas from './components/Estadisticas'
import Formulario from './components/Formulario'

const celebrar = () => {
  const o = { spread: 70, startVelocity: 38, ticks: 160, colors: ['#F2A9D3', '#C8DB8B', '#F5D769', '#B5C7F2', '#CFC8F6'], disableForReducedMotion: true }
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
  const tab = (on) => `grid size-12 place-items-center rounded-full transition-colors ${on ? 'text-white' : 'text-white/45'}`

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-32">
      <header className="sticky top-0 z-10 -mx-4 mb-3 bg-fondo/85 px-4 py-3 text-center backdrop-blur">
        <h1 className="text-[17px] font-semibold">{vista === 'hoy' ? 'Hoy' : 'Estadísticas'}</h1>
      </header>

      <main>
        {vista === 'hoy'
          ? <Hoy habitos={habitos} dia={dia} alAlternar={(id) => alternar(id, dia)} alEditar={setEditando} alCrear={() => setEditando({})} />
          : <Estadisticas habitos={habitos} alAlternar={alternar} />}
      </main>

      {/* Barra negra flotante con el «+» rosa encajado en una muesca */}
      <nav className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(env(safe-area-inset-bottom),14px)]">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around rounded-[28px] bg-barra px-6 shadow-lg shadow-black/15">
          <button className={tab(vista === 'hoy')} onClick={() => setVista('hoy')} aria-label="Hoy" aria-current={vista === 'hoy' ? 'page' : undefined}>
            <LayoutGrid size={23} />
          </button>
          <div className="-mt-9 grid size-[78px] place-items-center rounded-full bg-fondo">
            <button onClick={() => setEditando({})} aria-label="Nuevo hábito" className="grid size-[60px] place-items-center rounded-full bg-rosa text-[#121211] active:scale-95">
              <Plus size={28} strokeWidth={1.8} />
            </button>
          </div>
          <button className={tab(vista === 'stats')} onClick={() => setVista('stats')} aria-label="Estadísticas" aria-current={vista === 'stats' ? 'page' : undefined}>
            <ChartColumn size={23} />
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
