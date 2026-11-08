import { useEffect, useState, useCallback, useRef } from 'react'
import { clave, hoy, sumarDias } from './fechas'

export const LS = 'habitos-v1'
const COPIAS = 'habitos-copias'   // copias automáticas diarias (las 3 últimas)
const DANADO = 'habitos-v1-danado' // lo que no se pudo leer, intacto

const ls = (() => { try { const k = '__p'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage } catch { return null } })()
export const hayAlmacen = !!ls

export const valido = (hs) => Array.isArray(hs) && hs.every((h) => h && typeof h.id === 'string' && typeof h.nombre === 'string' && typeof h.creado === 'string' && h.hechos && typeof h.hechos === 'object')

// Devuelve { habitos, estado }: 'nuevo' (no hay nada), 'ok' o 'danado' (se guarda aparte y NO se sobrescribe)
function cargar() {
  if (!ls) return { habitos: ejemplos(), estado: 'sinAlmacen' }
  const raw = ls.getItem(LS)
  if (raw == null) return { habitos: ejemplos(), estado: 'nuevo' }
  try { const d = JSON.parse(raw); if (valido(d?.habitos)) return { habitos: d.habitos, estado: 'ok' } } catch {}
  try { ls.setItem(DANADO, raw) } catch {}
  return { habitos: [], estado: 'danado' }
}

const ejemplos = () => {
  const c = clave(hoy())
  return [
    { id: 'e1', nombre: 'Beber 2 litros de agua', desc: 'Una botella por la mañana y otra por la tarde', icono: 'gota', categoria: 'salud', frecuencia: 'diario', dias: [], momento: 'manana', creado: c, hechos: {} },
    { id: 'e2', nombre: 'Leer 20 minutos', desc: '', icono: 'libro', categoria: 'aprendizaje', frecuencia: 'diario', dias: [], momento: 'noche', creado: c, hechos: {} },
    { id: 'e3', nombre: 'Revisar gastos', desc: 'Apuntar lo gastado en el día', icono: 'hucha', categoria: 'finanzas', frecuencia: 'dias', dias: [1, 3, 5], momento: 'tarde', creado: c, hechos: {} },
  ]
}

export const leerCopias = () => { try { return JSON.parse(ls?.getItem(COPIAS)) ?? [] } catch { return [] } }

export function useHabitos() {
  const [{ habitos, estado }, setTodo] = useState(cargar)
  const setHabitos = useCallback((f) => setTodo((t) => ({ ...t, habitos: typeof f === 'function' ? f(t.habitos) : f })), [])
  const cambiado = useRef(false)

  // Copia automática: una por día, antes de tocar nada; se guardan las 3 últimas
  useEffect(() => {
    if (estado !== 'ok') return
    const hoyK = clave(hoy()), copias = leerCopias()
    if (copias[0]?.fecha === hoyK) return
    try { ls.setItem(COPIAS, JSON.stringify([{ fecha: hoyK, habitos }, ...copias].slice(0, 3))) } catch {}
  }, [estado]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { navigator.storage?.persist?.().catch(() => {}) }, [])

  useEffect(() => {
    if (!ls || (estado === 'danado' && !cambiado.current)) return // nunca escribir sobre datos que no se pudieron leer
    try { ls.setItem(LS, JSON.stringify({ v: 1, habitos })) } catch {}
  }, [habitos, estado])

  useEffect(() => {
    const f = (e) => { if (e.key === LS) { const c = cargar(); if (c.estado === 'ok') setTodo(c) } }
    addEventListener('storage', f)
    return () => removeEventListener('storage', f)
  }, [])

  const tocar = (f) => { cambiado.current = true; setHabitos(f) }

  const guardar = useCallback((h) => tocar((hs) => {
    const viejo = hs.find((x) => x.id === h.id)
    if (!viejo) return [...hs, { ...h, id: crypto.randomUUID?.() ?? String(Date.now()), creado: clave(hoy()), hechos: {} }]
    // Si cambia la frecuencia, la anterior queda en el historial hasta ayer (el pasado no se reescribe)
    let historial = viejo.historial ?? []
    const cambia = viejo.frecuencia !== h.frecuencia || [...viejo.dias].sort().join() !== [...h.dias].sort().join()
    const ayer = clave(sumarDias(hoy(), -1))
    if (cambia && ayer >= viejo.creado && historial.at(-1)?.hasta !== ayer)
      historial = [...historial, { hasta: ayer, frecuencia: viejo.frecuencia, dias: viejo.dias }]
    return hs.map((x) => (x.id === h.id ? { ...x, ...h, historial } : x))
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const borrar = useCallback((id) => {
    let quitado
    tocar((hs) => { const i = hs.findIndex((x) => x.id === id); quitado = { h: hs[i], i }; return hs.filter((x) => x.id !== id) })
    return () => tocar((hs) => (quitado?.h && !hs.some((x) => x.id === id) ? [...hs.slice(0, quitado.i), quitado.h, ...hs.slice(quitado.i)] : hs))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const alternar = useCallback((id, fecha = hoy()) => tocar((hs) => hs.map((x) => {
    if (x.id !== id) return x
    const k = clave(fecha), hechos = { ...x.hechos }
    if (hechos[k]) delete hechos[k]; else hechos[k] = 1
    return { ...x, hechos }
  })), []) // eslint-disable-line react-hooks/exhaustive-deps

  const reemplazar = useCallback((hs) => { cambiado.current = true; setTodo({ habitos: hs, estado: 'ok' }) }, [])

  return { habitos, estado, guardar, borrar, alternar, reemplazar }
}
