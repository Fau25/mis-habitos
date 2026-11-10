import { clave, desdeClave, sumarDias, hoy, DIAS } from './fechas'
import { Clock, Sunrise, Sun, Moon, Droplet, Leaf, Pill, BedDouble, Laptop, Apple, Footprints, BookOpen, PiggyBank,
  Dumbbell, PenLine, Music, Brush, PhoneOff, Sprout, Coffee, Dog, HeartPulse, Briefcase, Sparkles, Target, Bike } from 'lucide-react'

export const ICONOS = { gota: Droplet, hoja: Leaf, pastilla: Pill, cama: BedDouble, portatil: Laptop, manzana: Apple,
  pasos: Footprints, libro: BookOpen, hucha: PiggyBank, pesas: Dumbbell, pluma: PenLine, musica: Music, limpiar: Brush,
  sinmovil: PhoneOff, brote: Sprout, cafe: Coffee, perro: Dog, corazon: HeartPulse, trabajo: Briefcase, bici: Bike,
  diana: Target, chispa: Sparkles }

// Pastel por categoría: `suave` = fondo, `fuerte` = icono, puntos y barras (≥ 3,9:1 sobre el suave, ≥ 4,5:1 sobre blanco)
export const CATEGORIAS = {
  salud:         { nombre: 'Salud',         icono: 'corazon', suave: '#FBE3EC', fuerte: '#B84D74' },
  productividad: { nombre: 'Productividad', icono: 'trabajo', suave: '#E0EAF9', fuerte: '#4A70B0' },
  bienestar:     { nombre: 'Bienestar',     icono: 'hoja',    suave: '#EBE5F9', fuerte: '#7559BD' },
  finanzas:      { nombre: 'Finanzas',      icono: 'hucha',   suave: '#FAEDCF', fuerte: '#97700F' },
  aprendizaje:   { nombre: 'Aprendizaje',   icono: 'libro',   suave: '#DFF0E2', fuerte: '#3F7F4F' },
  otros:         { nombre: 'Otros',         icono: 'chispa',  suave: '#EDE9E3', fuerte: '#756C60' },
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
  todo:   { nombre: 'Todo el día', corto: 'todo el día', Icono: Clock },
  manana: { nombre: 'Mañana', corto: 'mañana', Icono: Sunrise },
  tarde:  { nombre: 'Tarde',  corto: 'tarde',  Icono: Sun },
  noche:  { nombre: 'Noche',  corto: 'noche',  Icono: Moon },
}
export const ORDEN_MOMENTO = { todo: 0, manana: 1, tarde: 2, noche: 3 }

// Frecuencia que tenía el hábito ese día: `historial` guarda las anteriores con su último día (`hasta`)
export const configEl = (h, k) => (h.historial ?? []).find((c) => k <= c.hasta) ?? h
export const tocaEl = (h, fecha) => {
  const k = clave(fecha)
  if (k < h.creado) return false
  const c = configEl(h, k)
  return c.frecuencia === 'diario' || c.dias.includes(new Date(fecha).getDay())
}
export const hecho = (h, fecha) => !!h.hechos[clave(fecha)]

// Días seguidos cumplidos hasta `ref` (solo cuentan los días en que toca). `ref` sin hacer no rompe la racha.
export function rachaActual(h, ref = hoy()) {
  let d = ref, n = 0
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
// % de todos los días-hábito que tocaban en los últimos n días
export function porcentajeGlobal(habitos, n = 30) {
  let t = 0, c = 0
  for (let i = 0; i < n; i++) { const r = resumenDia(habitos, sumarDias(hoy(), -i)); t += r.total; c += r.hechos }
  return t ? Math.round((c / t) * 100) : null
}
export function porcentaje(h, n = 30) {
  let t = 0, c = 0
  for (let i = 0; i < n; i++) { const d = sumarDias(hoy(), -i); if (tocaEl(h, d)) { t++; if (hecho(h, d)) c++ } }
  return t ? Math.round((c / t) * 100) : null
}

// Mezcla dos colores #rrggbb (t = 0 → a, 1 → b)
export const mezcla = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')
// Texto sobre el fondo pastel de la categoría (≥ 4,5:1)
export const tituloDe = (c) => mezcla(c.fuerte, '#18181B', 0.25)
