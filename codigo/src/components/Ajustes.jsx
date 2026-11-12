import { useRef, useState } from 'react'
import { Download, Upload, RotateCcw } from 'lucide-react'
import { valido, leerCopias, hayAlmacen, SYNC, useSyncEstado } from '../lib/useHabitos'

const fmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const Carta = ({ titulo, children }) => (
  <section className="mt-4 rounded-2xl border border-linea bg-carta p-4">
    <h2 className="text-[15px] font-semibold">{titulo}</h2>
    {children}
  </section>
)
const boton = 'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium'

const hora = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
function textoSync(e) {
  if (e.t === 'ok') return 'Sincronizado a las ' + hora(e.x)
  if (e.t === 'sync') return 'Sincronizando…'
  if (e.t === 'error') return 'No se pudo sincronizar: ' + e.x
  return ''
}

function Sincronizacion({ avisar }) {
  const e = useSyncEstado()
  const [url, setUrl] = useState('')
  const [clave, setClave] = useState('')
  const [conectando, setConectando] = useState(false)
  const [fallo, setFallo] = useState('')
  const [, refrescar] = useState(0)
  const conectar = async (ev) => {
    ev.preventDefault(); setFallo(''); setConectando(true)
    try { await SYNC.conectar(url, clave); setClave(''); avisar('Sincronización activada') }
    catch (err) { setFallo(err.message) }
    finally { setConectando(false) }
  }
  const campo = 'mt-1 h-12 w-full rounded-xl border border-linea bg-fondo px-3 text-base'
  if (SYNC.conectado) return (
    <Carta titulo="Sincronización">
      <p className="mt-1 text-sm text-sec">Tus hábitos se guardan en tu Google Drive y se comparten entre tus dispositivos.</p>
      <p role="status" className={`mt-2 text-sm ${e.t === 'error' ? 'text-red-700' : 'text-sec'}`}>{textoSync(e)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => SYNC.sincronizar()} className={`${boton} bg-pista`}>Sincronizar ahora</button>
        <button onClick={() => { if (confirm('¿Desconectar la sincronización? Los hábitos se quedan en este dispositivo y en Drive.')) { SYNC.desconectar(); refrescar((n) => n + 1) } }} className={`${boton} bg-pista`}>Desconectar</button>
      </div>
    </Carta>
  )
  return (
    <Carta titulo="Sincronización">
      <form onSubmit={conectar}>
        <p className="mt-1 text-sm text-sec">Conecta tu script de Google «Hábitos» para tener los mismos hábitos en el iPhone, el iPad y el PC.</p>
        <label className="mt-3 block text-[13px] text-sec">Dirección del script (acaba en /exec)
          <input type="url" value={url} onChange={(x) => setUrl(x.target.value)} autoComplete="off" spellCheck="false" placeholder="https://script.google.com/macros/s/…/exec" className={campo} />
        </label>
        <label className="mt-3 block text-[13px] text-sec">Contraseña del script
          <input type="password" value={clave} onChange={(x) => setClave(x.target.value)} autoComplete="off" className={campo} />
        </label>
        {(fallo || e.t === 'error') && <p role="status" className="mt-2 text-sm text-red-700">{fallo || textoSync(e)}</p>}
        <button disabled={conectando || !url || !clave} className={`${boton} mt-3 w-full bg-tinta text-white disabled:opacity-35`}>{conectando ? 'Conectando…' : 'Conectar'}</button>
      </form>
    </Carta>
  )
}

export default function Ajustes({ habitos, reemplazar, avisar }) {
  const archivo = useRef(null)
  const [pendiente, setPendiente] = useState(null) // { habitos, origen } esperando confirmación
  const copias = leerCopias()

  const exportar = async () => {
    const nombre = `habitos-${new Date().toISOString().slice(0, 10)}.json`
    const blob = new Blob([JSON.stringify({ v: 1, app: 'habitos', exportado: new Date().toISOString(), habitos }, null, 1)], { type: 'application/json' })
    const file = new File([blob], nombre, { type: 'application/json' })
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Copia de Hábitos' }); return }
    } catch (e) { if (e.name === 'AbortError') return }
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: nombre })
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    avisar('Copia descargada')
  }

  const leerArchivo = async (e) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    try {
      const d = JSON.parse(await f.text())
      const hs = Array.isArray(d) ? d : d?.habitos
      if (!valido(hs)) throw new Error()
      setPendiente({ habitos: hs, origen: `el archivo «${f.name}» (${hs.length} hábitos)` })
    } catch { avisar('Ese archivo no es una copia de Hábitos') }
  }

  const confirmar = () => { reemplazar(pendiente.habitos); setPendiente(null); avisar('Copia restaurada') }

  return (
    <>
      <header className="px-1">
        <p className="text-[13px] text-sec">Tus datos y la app</p>
        <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight">Ajustes</h1>
      </header>

      <Sincronizacion avisar={avisar} />

      <Carta titulo="Copia de seguridad">
        <p className="mt-1 text-sm text-sec">{SYNC.conectado ? 'Además de Drive, puedes guardar una copia en un archivo.' : 'Tus hábitos solo se guardan en este navegador. Guarda una copia de vez en cuando (por ejemplo en Archivos o iCloud Drive).'}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={exportar} disabled={!habitos.length} className={`${boton} bg-tinta text-white disabled:opacity-35`}><Download size={17} /> Exportar</button>
          <button onClick={() => archivo.current?.click()} className={`${boton} bg-pista`}><Upload size={17} /> Importar</button>
        </div>
        <input ref={archivo} type="file" accept="application/json,.json" className="hidden" onChange={leerArchivo} aria-label="Elegir copia para importar" />
      </Carta>

      {pendiente && (
        <div role="alert" className="mt-3 rounded-2xl border border-tinta bg-carta p-4 text-sm">
          <p>Vas a sustituir tus hábitos actuales por {pendiente.origen}. Lo de ahora se perderá si no lo has exportado.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={confirmar} className={`${boton} flex-1 bg-tinta text-white`}>Sustituir</button>
            <button onClick={() => setPendiente(null)} className={`${boton} flex-1 bg-pista`}>Cancelar</button>
          </div>
        </div>
      )}

      <Carta titulo="Copias automáticas">
        <p className="mt-1 text-sm text-sec">Cada día, al abrir la app, se guarda una copia aquí mismo. Se conservan las 3 últimas.</p>
        {copias.length ? (
          <ul className="mt-2">
            {copias.map((c) => (
              <li key={c.fecha} className="flex items-center gap-3 border-t border-linea py-2.5 first:border-t-0">
                <span className="flex-1 text-sm first-letter:uppercase">{fmt.format(new Date(c.fecha + 'T00:00'))} <span className="text-sec">· {c.habitos.length} hábitos</span></span>
                <button onClick={() => setPendiente({ habitos: c.habitos, origen: `la copia del ${fmt.format(new Date(c.fecha + 'T00:00'))}` })}
                  className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium" aria-label={`Restaurar la copia del ${c.fecha}`}>
                  <RotateCcw size={15} /> Restaurar
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-sec">Aún no hay copias.</p>}
      </Carta>

      <p className="mt-6 text-center font-mono text-[11px] text-sec">Hábitos {__VERSION__}{hayAlmacen ? '' : ' · sin almacenamiento'}</p>
    </>
  )
}
