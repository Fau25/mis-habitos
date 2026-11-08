import { clave, desdeClave, sumarDias, hoy, DIAS } from './fechas'
import { Sunrise, Sun, Moon } from 'lucide-react'

// Colores pastel de la referencia; el tono suave es el mismo con transparencia (sirve en claro y oscuro)
export const CATEGORIAS = {
  salud:         { nombre: 'Salud',         color: '#F2A9D3', emoji: '💧' },
  productividad: { nombre: 'Productividad', color: '#B5C7F2', emoji: '💻' },
  bienestar:     { nombre: 'Bienestar',     color: '#CFC8F6', emoji: '🧘' },
  finanzas:      { nombre: 'Finanzas',      color: '#F5D769', emoji: '💰' },
  aprendizaje:   { nombre: 'Aprendizaje',   color: '#C8DB8B', emoji: '📚' },
  otros:         { nombre: 'Otros',         color: '#E3D3BE', emoji: '✨' },
}
export const EMOJIS = ['💧','🧘','💊','😴','💻','🥑','🏃','📚','💰','🍎','🦷','🚶','🏋️','✍️','🎸','🧹','📵','🌱','☕','🐶','🧴','🙏','🎯','❤️']

export const cat = (h) => CATEGORIAS[h.categoria] ?? CATEGORIAS.otros
export const colorDe = (h) => cat(h).color
export const suave = (c, a = '47') => c + a
export const emojiDe = (h) => h.emoji || cat(h).emoji

export const frecuenciaTexto = (h) => {
  if (h.frecuencia === 'diario' || h.dias.length === 7) return 'Cada día'
  if (h.dias.length <= 3) return DIAS.filter((d) => h.dias.includes(d.n)).map((d) => d.largo.slice(0, 3)).join(' · ')
  return `${h.dias.length} días por semana`
}

export const MOMENTOS = {
  manana: { nombre: 'Mañana', Icono: Sunrise },
  tarde:  { nombre: 'Tarde',  Icono: Sun },
  noche:  { nombre: 'Noche',  Icono: Moon },
}

export const tocaEl = (h, fecha) => {
  if (clave(fecha) < h.creado) return false
  return h.frecuencia === 'diario' || h.dias.includes(new Date(fecha).getDay())
}

export const hecho = (h, fecha) => !!h.hechos[clave(fecha)]

// Días seguidos cumplidos (solo cuentan los días en que toca). Hoy sin hacer no rompe la racha.
export function rachaActual(h) {
  let d = hoy(), n = 0
  if (tocaEl(h, d) && !hecho(h, d)) d = sumarDias(d, -1)
  for (let i = 0; i < 3660 && clave(d) >= h.creado; i++, d = sumarDias(d, -1)) {
    if (!tocaEl(h, d)) continue
    if (hecho(h, d)) n++
    else break
  }
  return n
}

export function rachaRecord(h) {
  const fin = clave(hoy())
  let d = desdeClave(h.creado), run = 0, max = 0
  for (let i = 0; i < 3660 && clave(d) <= fin; i++, d = sumarDias(d, 1)) {
    if (!tocaEl(h, d)) continue
    if (hecho(h, d)) max = Math.max(max, ++run)
    else if (clave(d) !== fin) run = 0
  }
  return max
}

export function resumenDia(habitos, fecha) {
  const toca = habitos.filter((h) => tocaEl(h, fecha))
  return { total: toca.length, hechos: toca.filter((h) => hecho(h, fecha)).length }
}

// Puntuación 0–10 del día
export const puntuacion = (habitos, fecha) => {
  const { total, hechos } = resumenDia(habitos, fecha)
  return total ? (hechos / total) * 10 : null
}

// Rachas generales: días seguidos con todo hecho (los días sin nada que hacer no cuentan ni rompen)
export function rachasGenerales(habitos) {
  if (!habitos.length) return { actual: 0, record: 0 }
  const inicio = habitos.reduce((m, h) => (h.creado < m ? h.creado : m), clave(hoy()))
  const fin = clave(hoy())
  let d = desdeClave(inicio), run = 0, record = 0
  for (let i = 0; i < 3660 && clave(d) <= fin; i++, d = sumarDias(d, 1)) {
    const { total, hechos } = resumenDia(habitos, d)
    if (!total) continue
    if (hechos === total) record = Math.max(record, ++run)
    else if (clave(d) !== fin) run = 0
  }
  return { actual: run, record }
}

// Porcentaje de días cumplidos de un hábito en los últimos n días (null si no tocaba ninguno)
export function porcentaje(h, n = 30) {
  let t = 0, c = 0
  for (let i = 0; i < n; i++) { const d = sumarDias(hoy(), -i); if (tocaEl(h, d)) { t++; if (hecho(h, d)) c++ } }
  return t ? Math.round((c / t) * 100) : null
}
