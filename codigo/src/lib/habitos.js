import { clave, desdeClave, sumarDias, hoy, DIAS } from './fechas'
import { Sunrise, Sun, Moon, Droplet, Leaf, Pill, BedDouble, Laptop, Apple, Footprints, BookOpen, PiggyBank,
  Dumbbell, PenLine, Music, Brush, PhoneOff, Sprout, Coffee, Dog, HeartPulse, Briefcase, Sparkles, Target, Bike } from 'lucide-react'

export const ICONOS = { gota: Droplet, hoja: Leaf, pastilla: Pill, cama: BedDouble, portatil: Laptop, manzana: Apple,
  pasos: Footprints, libro: BookOpen, hucha: PiggyBank, pesas: Dumbbell, pluma: PenLine, musica: Music, limpiar: Brush,
  sinmovil: PhoneOff, brote: Sprout, cafe: Coffee, perro: Dog, corazon: HeartPulse, trabajo: Briefcase, bici: Bike,
  diana: Target, chispa: Sparkles }

export const CATEGORIAS = {
  salud:         { nombre: 'Salud',         icono: 'corazon' },
  productividad: { nombre: 'Productividad', icono: 'trabajo' },
  bienestar:     { nombre: 'Bienestar',     icono: 'hoja' },
  finanzas:      { nombre: 'Finanzas',      icono: 'hucha' },
  aprendizaje:   { nombre: 'Aprendizaje',   icono: 'libro' },
  otros:         { nombre: 'Otros',         icono: 'chispa' },
}
export const cat = (h) => CATEGORIAS[h.categoria] ?? CATEGORIAS.otros
export const nombreIcono = (h) => (ICONOS[h.icono] ? h.icono : cat(h).icono)
export const IconoDe = (h) => ICONOS[nombreIcono(h)]

export const frecuenciaTexto = (h) => {
  if (h.frecuencia === 'diario' || h.dias.length === 7) return 'cada día'
  const ds = DIAS.filter((d) => h.dias.includes(d.n))
  if ([1, 2, 3, 4, 5].every((n) => h.dias.includes(n)) && h.dias.length === 5) return 'L–V'
  return ds.map((d) => d.corto).join(' ')
}

export const MOMENTOS = {
  manana: { nombre: 'Mañana', corto: 'mañana', Icono: Sunrise },
  tarde:  { nombre: 'Tarde',  corto: 'tarde',  Icono: Sun },
  noche:  { nombre: 'Noche',  corto: 'noche',  Icono: Moon },
}
export const ORDEN_MOMENTO = { manana: 0, tarde: 1, noche: 2 }

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
export function porcentaje(h, n = 30) {
  let t = 0, c = 0
  for (let i = 0; i < n; i++) { const d = sumarDias(hoy(), -i); if (tocaEl(h, d)) { t++; if (hecho(h, d)) c++ } }
  return t ? Math.round((c / t) * 100) : null
}
