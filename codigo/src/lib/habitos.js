import { clave, desdeClave, sumarDias, hoy } from './fechas'
import { HeartPulse, Briefcase, Flower2, PiggyBank, BookOpen, Sparkles, Sunrise, Sun, Moon } from 'lucide-react'

// Clases completas para que Tailwind las incluya
export const CATEGORIAS = {
  salud:         { nombre: 'Salud',         Icono: HeartPulse, punto: 'bg-emerald-500', suave: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300', borde: 'border-emerald-500', relleno: 'bg-emerald-500' },
  productividad: { nombre: 'Productividad', Icono: Briefcase,  punto: 'bg-blue-500',    suave: 'bg-blue-500/12 text-blue-700 dark:text-blue-300',          borde: 'border-blue-500',    relleno: 'bg-blue-500' },
  bienestar:     { nombre: 'Bienestar',     Icono: Flower2,    punto: 'bg-violet-500',  suave: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',    borde: 'border-violet-500',  relleno: 'bg-violet-500' },
  finanzas:      { nombre: 'Finanzas',      Icono: PiggyBank,  punto: 'bg-amber-500',   suave: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',       borde: 'border-amber-500',   relleno: 'bg-amber-500' },
  aprendizaje:   { nombre: 'Aprendizaje',   Icono: BookOpen,   punto: 'bg-sky-500',     suave: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',             borde: 'border-sky-500',     relleno: 'bg-sky-500' },
  otros:         { nombre: 'Otros',         Icono: Sparkles,   punto: 'bg-zinc-500',    suave: 'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300',          borde: 'border-zinc-500',    relleno: 'bg-zinc-500' },
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

// Resumen de un día: cuántos tocaban y cuántos se hicieron
export function resumenDia(habitos, fecha) {
  const toca = habitos.filter((h) => tocaEl(h, fecha))
  return { total: toca.length, hechos: toca.filter((h) => hecho(h, fecha)).length }
}
