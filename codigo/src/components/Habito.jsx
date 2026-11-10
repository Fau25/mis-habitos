import { ICONOS, nombreIcono } from '../lib/habitos'

export const IconoHabito = ({ h, ...p }) => { const I = ICONOS[nombreIcono(h)]; return <I strokeWidth={1.8} aria-hidden="true" {...p} /> }
