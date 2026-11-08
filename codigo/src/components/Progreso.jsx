// Anillo de progreso del día
export default function Progreso({ hechos, total }) {
  const p = total ? hechos / total : 0
  const r = 30, c = 2 * Math.PI * r
  return (
    <div className="relative size-20 shrink-0" role="img" aria-label={`${Math.round(p * 100)} % completado`}>
      <svg viewBox="0 0 72 72" className="size-full -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)}
          className={`transition-[stroke-dashoffset] duration-500 ${p === 1 ? 'stroke-emerald-500' : 'stroke-indigo-500'}`} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-base font-semibold tabular-nums">{Math.round(p * 100)}%</span>
    </div>
  )
}
