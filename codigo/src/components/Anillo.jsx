import { colorDe, emojiDe, hecho, suave } from '../lib/habitos'

const R = 104, C = 150
const punto = (a) => [C + R * Math.cos((a * Math.PI) / 180), C + R * Math.sin((a * Math.PI) / 180)]

// Anillo de segmentos (uno por hábito de hoy) con su emoji; hecho = color lleno, pendiente = color suave
export default function Anillo({ habitos, dia, children }) {
  const n = habitos.length
  const grosor = n <= 6 ? 46 : n <= 9 ? 38 : 30
  const tapa = ((grosor / 2) / R) * (180 / Math.PI)
  const tramo = 360 / Math.max(n, 1)
  const hueco = n > 1 ? Math.min(2 * tapa + 7, tramo - 1) : 0

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <svg viewBox="0 0 300 300" className="size-full" aria-hidden="true">
        {n === 0 && <circle cx={C} cy={C} r={R} fill="none" strokeWidth={grosor} stroke="var(--pista)" />}
        {n === 1 && <circle cx={C} cy={C} r={R} fill="none" strokeWidth={grosor}
          stroke={hecho(habitos[0], dia) ? colorDe(habitos[0]) : suave(colorDe(habitos[0]), '55')} className="transition-[stroke] duration-300" />}
        {n > 1 && habitos.map((h, i) => {
          const a0 = -90 + i * tramo + hueco / 2, a1 = a0 + tramo - hueco
          const [x0, y0] = punto(a0), [x1, y1] = punto(a1)
          return (
            <path key={h.id} d={`M${x0} ${y0} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`}
              fill="none" strokeWidth={grosor} strokeLinecap="round"
              stroke={hecho(h, dia) ? colorDe(h) : suave(colorDe(h), '55')} className="transition-[stroke] duration-300" />
          )
        })}
        {habitos.map((h, i) => {
          const [x, y] = punto(n === 1 ? -90 : -90 + i * tramo + tramo / 2)
          return <text key={h.id} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={grosor * 0.52}
            opacity={hecho(h, dia) ? 1 : 0.6}>{emojiDe(h)}</text>
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
