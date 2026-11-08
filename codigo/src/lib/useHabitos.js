import { useEffect, useState, useCallback } from 'react'
import { clave, hoy } from './fechas'

const LS = 'habitos-v1'

const leer = () => {
  try { const d = JSON.parse(localStorage.getItem(LS)); if (Array.isArray(d?.habitos)) return d.habitos } catch {}
  return null
}

// Ejemplos para la primera vez
const ejemplos = () => {
  const c = clave(hoy())
  return [
    { id: 'e1', nombre: 'Beber 2 litros de agua', desc: 'Una botella por la mañana y otra por la tarde', icono: 'gota', categoria: 'salud', frecuencia: 'diario', dias: [], momento: 'manana', creado: c, hechos: {} },
    { id: 'e2', nombre: 'Leer 20 minutos', desc: '', icono: 'libro', categoria: 'aprendizaje', frecuencia: 'diario', dias: [], momento: 'noche', creado: c, hechos: {} },
    { id: 'e3', nombre: 'Revisar gastos', desc: 'Apuntar lo gastado en el día', icono: 'hucha', categoria: 'finanzas', frecuencia: 'dias', dias: [1, 3, 5], momento: 'tarde', creado: c, hechos: {} },
  ]
}

export function useHabitos() {
  const [habitos, setHabitos] = useState(() => leer() ?? ejemplos())

  useEffect(() => {
    try { localStorage.setItem(LS, JSON.stringify({ v: 1, habitos })) } catch {}
  }, [habitos])

  // Si cambian los datos en otra pestaña
  useEffect(() => {
    const f = (e) => { if (e.key === LS) { const d = leer(); if (d) setHabitos(d) } }
    addEventListener('storage', f)
    return () => removeEventListener('storage', f)
  }, [])

  const guardar = useCallback((h) => setHabitos((hs) => {
    if (h.id && hs.some((x) => x.id === h.id)) return hs.map((x) => (x.id === h.id ? { ...x, ...h } : x))
    return [...hs, { ...h, id: crypto.randomUUID?.() ?? String(Date.now()), creado: clave(hoy()), hechos: {} }]
  }), [])

  const borrar = useCallback((id) => setHabitos((hs) => hs.filter((x) => x.id !== id)), [])

  const alternar = useCallback((id, fecha = hoy()) => setHabitos((hs) => hs.map((x) => {
    if (x.id !== id) return x
    const k = clave(fecha), hechos = { ...x.hechos }
    if (hechos[k]) delete hechos[k]; else hechos[k] = 1
    return { ...x, hechos }
  })), [])

  return { habitos, guardar, borrar, alternar }
}
