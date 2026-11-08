export const clave = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const desdeClave = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const sumarDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const hoy = () => { const x = new Date(); x.setHours(0, 0, 0, 0); return x }

// Lunes primero
export const DIAS = [
  { n: 1, corto: 'L', largo: 'lunes' }, { n: 2, corto: 'M', largo: 'martes' },
  { n: 3, corto: 'X', largo: 'miércoles' }, { n: 4, corto: 'J', largo: 'jueves' },
  { n: 5, corto: 'V', largo: 'viernes' }, { n: 6, corto: 'S', largo: 'sábado' },
  { n: 0, corto: 'D', largo: 'domingo' },
]

export const fechaLarga = (d) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
