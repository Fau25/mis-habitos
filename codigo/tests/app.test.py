"""Pruebas de Hábitos (Playwright, Chromium). Uso: python3 tests/app.test.py [url]  (por defecto sirve dist/ en el puerto 8811)."""
import json, sys, datetime, subprocess, time, os
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else None
srv = None
if not URL:
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8811', '-d', os.path.join(os.path.dirname(__file__), '..', 'dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1); URL = 'http://localhost:8811/'

hoy = datetime.date.today(); K = lambda n: str(hoy - datetime.timedelta(n))
fallos, n = [], 0
def ok(c, msg):
    global n; n += 1
    print(('  ✓ ' if c else '  ✗ ') + msg)
    if not c: fallos.append(msg); print(f'::error::{msg}')
def hab(id, nombre, **k):
    return {'id': id, 'nombre': nombre, 'desc': '', 'icono': 'gota', 'categoria': 'salud', 'frecuencia': 'diario', 'dias': [], 'momento': 'manana', 'creado': K(30), 'hechos': {}, **k}
def poner(pg, hs, raw=None):
    pg.evaluate("([k,v])=>{localStorage.clear();localStorage.setItem(k,v)}", ['habitos-v1', raw if raw is not None else json.dumps({'v': 1, 'habitos': hs})]); pg.reload()
datos = lambda pg: json.loads(pg.evaluate("localStorage.getItem('habitos-v1')"))['habitos']

with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 390, 'height': 844}, accept_downloads=True)
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(URL); pg.evaluate('localStorage.clear()'); pg.reload()

    print('Básico')
    ok(pg.locator('text=Beber 2 litros de agua').count() == 1, 'primera vez: hábitos de ejemplo')
    pg.click('[aria-label="Nuevo hábito"]'); pg.fill('input >> nth=0', 'Meditar'); pg.fill('input >> nth=1', 'Diez minutos'); pg.click('button:has-text("Crear hábito")')
    ok(pg.locator('text=Diez minutos').count() == 1, 'crear hábito y la descripción se ve (F5)')
    pg.click('[aria-label="Nuevo hábito"]'); pg.fill('input >> nth=0', 'Estirar'); pg.click('button:has-text("Todo el día")'); pg.click('button:has-text("Crear hábito")')
    ok(any(h['nombre'] == 'Estirar' and h['momento'] == 'todo' for h in datos(pg)) and pg.locator('text=todo el día').count() >= 1, 'momento «Todo el día»')
    pg.click('[aria-label="Marcar Meditar"]'); ok(any(h['nombre'] == 'Meditar' and h['hechos'] for h in datos(pg)), 'marcar guarda')
    pg.reload(); ok(pg.locator('[aria-label="Desmarcar Meditar"]').count() == 1, 'persiste al recargar')

    print('Datos a salvo (F1, F2, F7)')
    poner(pg, None, raw='{roto')
    ok(pg.evaluate("localStorage.getItem('habitos-v1')") == '{roto', 'datos dañados NO se sobrescriben al abrir')
    ok(pg.evaluate("localStorage.getItem('habitos-v1-danado')") == '{roto', 'datos dañados apartados en habitos-v1-danado')
    ok(pg.locator('[role=alert]').count() == 1, 'aviso de datos dañados')
    poner(pg, [hab('a', 'Agua', hechos={K(1): 1})])
    pg.click('[aria-label="Ajustes"]')
    with pg.expect_download() as d: pg.click('text=Exportar')
    exp = json.load(open(d.value.path())); ok(exp['habitos'][0]['nombre'] == 'Agua', 'exportar descarga una copia válida')
    ok(pg.locator('text=Restaurar').count() >= 1, 'copia automática del día creada')
    open('/tmp/_copia.json', 'w').write(json.dumps({'v': 1, 'habitos': [hab('z', 'Importado')]}))
    pg.set_input_files('input[type=file]', '/tmp/_copia.json'); pg.click('button:has-text("Sustituir")')
    ok([h['nombre'] for h in datos(pg)] == ['Importado'], 'importar sustituye tras confirmar')
    open('/tmp/_mal.json', 'w').write('{"hola":1}'); pg.set_input_files('input[type=file]', '/tmp/_mal.json')
    try: pg.wait_for_selector('text=no es una copia', timeout=4000); avisa = True
    except Exception: avisa = False
    ok(avisa and [h['nombre'] for h in datos(pg)] == ['Importado'], 'importar un archivo inválido avisa y no toca nada')
    pg2 = b.new_page(); pg2.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('x')}})")
    pg2.goto(URL); pg2.wait_for_selector('h1'); ok(pg2.locator('text=no deja guardar').count() == 1, 'sin almacenamiento: aviso (F7)'); pg2.close()

    print('Funciones (F3, F4, F6, F8)')
    poner(pg, [hab('a', 'Agua', creado=K(20), hechos={K(i): 1 for i in range(1, 21)}), hab('b', 'Leer')])
    pg.click('button:has-text("Leer")'); pg.click('text=Eliminar'); pg.click('text=¿Seguro?')
    ok(len(datos(pg)) == 1, 'eliminar'); pg.click('text=Deshacer'); ok(len(datos(pg)) == 2 and datos(pg)[1]['id'] == 'b', 'deshacer devuelve el hábito en su sitio (F3)')
    pg.click('[aria-label="Semana anterior"]'); ok(pg.locator('text=Corrigiendo').count() == 1, 'ir a la semana anterior (F4)')
    pg.locator('[role=group] button').first.click(); pg.click('[aria-label^="Desmarcar Agua"]')
    lunes_ant = hoy - datetime.timedelta(days=hoy.weekday() + 7)
    ok(str(lunes_ant) not in datos(pg)[0]['hechos'], 'corregir el lunes de la semana pasada')
    pg.click('text=Volver a hoy')
    pg.click('main li button:has-text("Agua") >> nth=0'); pg.click('text=Días concretos'); pg.click('[aria-label="sábado"]'); pg.click('button:has-text("Guardar")')
    h = datos(pg)[0]; ok(h.get('historial') and h['historial'][0]['frecuencia'] == 'diario' and h['historial'][0]['hasta'] == K(1), 'cambiar frecuencia guarda la anterior (F6)')
    pg.click('[aria-label="Estadísticas"]'); ok(pg.locator('text=/\\/1[0-9]d/').count() >= 1, 'el pasado conserva su récord tras cambiar la frecuencia')

    poner(pg, [hab('a', 'Agua', hechos={K(1): 1}), hab('f', 'Gastos', categoria='finanzas', hechos={K(1): 1})])
    pg.click('[aria-label="Estadísticas"]'); pg.click('button:has-text("Finanzas")')
    ok(pg.locator('main li').count() == 1 and pg.locator('text=Gastos').count() == 1, 'filtrar estadísticas por categoría')
    ok('rgb(151, 112, 15)' in pg.evaluate("[...document.querySelectorAll('main span')].map(e=>getComputedStyle(e).backgroundColor).join()"), 'el mapa y su leyenda usan los colores de la categoría')

    print('Accesibilidad (U2, U3, U4)')
    pg.click('[aria-label="Hoy"]'); pg.focus('[aria-label="Nuevo hábito"]'); pg.keyboard.press('Enter')
    ok(pg.evaluate("document.querySelector('main').inert === true"), 'fondo inerte con la hoja abierta')
    pg.keyboard.press('Escape'); ok(pg.evaluate("document.activeElement.getAttribute('aria-label')") == 'Nuevo hábito', 'el foco vuelve al botón al cerrar')
    ok(pg.locator('[role=group] button').first.evaluate("e=>e.textContent.startsWith('L')"), 'los días se nombran empezando por lo visible')
    box = pg.locator('[aria-label^="Marcar"], [aria-label^="Desmarcar"]').first.bounding_box(); ok(box['width'] >= 44, 'casilla de 44 px')

    print('Versión y seguridad')
    pg.click('[aria-label="Ajustes"]'); ok(pg.locator('text=/Hábitos \\d{8}\\.\\d{4}/').count() == 1, 'versión visible en Ajustes')
    ok(pg.evaluate("!!document.querySelector('meta[http-equiv=Content-Security-Policy]')"), 'CSP presente')
    ok(not errs, 'sin errores en consola ' + (str(errs) if errs else ''))
    b.close()
if srv: srv.terminate()
print(f'\n{n - len(fallos)}/{n} bien' + ('' if not fallos else ' · FALLAN: ' + '; '.join(fallos)))
sys.exit(1 if fallos else 0)
