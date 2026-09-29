# Guía de Estilos — Laboratorios Kener

Documento de referencia visual para el rediseño web de Kener (Memento Studio). Traduce la Guía Gráfica oficial de marca (`Guia_Gráfica.pdf`) a tokens y componentes web listos para producción, sobre Bootstrap 5.3.

## Archivos del proyecto

```
guia-estilos-kener.html   → Maquetación (estructura y contenido)
kener-styles.css          → Apariencia (todo el CSS de marca)
README.md                 → Esta documentación
```

Los tres archivos deben mantenerse **en la misma carpeta**: el HTML enlaza a `kener-styles.css` con una ruta relativa (`<link href="kener-styles.css">`). Si separas el CSS a otra carpeta, actualiza esa ruta.

## Cómo previsualizarla

Abre `guia-estilos-kener.html` directamente en un navegador (doble clic, o "Abrir con..."). No requiere servidor ni build: Bootstrap y la fuente Ubuntu se cargan desde CDN, así que **necesitas conexión a internet** para verla con sus estilos completos.

Si vas a trabajar sin internet, descarga localmente:
- Bootstrap 5.3 CSS/JS: `https://getbootstrap.com/docs/5.3/getting-started/download/`
- Fuente Ubuntu: `https://fonts.google.com/specimen/Ubuntu`

y cambia los enlaces `<link>`/`<script>` del `<head>` para que apunten a esas copias locales.

## Qué separa cada archivo

| Archivo | Responsabilidad | Cuándo lo editas |
|---|---|---|
| `guia-estilos-kener.html` | Estructura: secciones, textos, orden del contenido, qué componente de Bootstrap usa cada bloque | Al agregar/quitar una sección, cambiar textos, o reordenar contenido |
| `kener-styles.css` | Apariencia: colores, tipografía, radios, sombras, y las clases que Bootstrap no cubre (logo, degradados, íconos...) | Al ajustar cualquier valor visual de marca |

Esta separación existe para que el equipo de diseño pueda tocar `kener-styles.css` sin arriesgar la estructura del HTML, y para que el HTML sea portable a otro sistema de estilos si hiciera falta.

## Editar los tokens de marca (lo más común)

Todo color, tipografía y radio vive como variable CSS en `kener-styles.css`, dentro del bloque `:root` (primeras ~40 líneas del archivo). Cambia el valor ahí y se actualiza en **todo** el documento, incluidos los botones y utilidades de Bootstrap sobreescritas más abajo.

| Variable | Valor actual | Uso | Fuente |
|---|---|---|---|
| `--primary` | `#005A7B` | Color de marca — CTAs, títulos clave, logotipo | Guia_Gráfica.pdf, "03 · El color" (Orient) |
| `--primary-soft` | `#7EACBC` | Wordmark, texto sobre fondo oscuro | Guia_Gráfica.pdf, "03 · El color" |
| `--primary-slate` | `#6C89A3` | Apoyo, degradados, fondos medios | Guia_Gráfica.pdf, "03 · El color" |
| `--primary-pale` | `#B5CCD6` | Fondos claros, bordes | Guia_Gráfica.pdf, "03 · El color" |
| `--sec-grey` … `--sec-pink` | 6 tonos | Paleta secundaria — uso decorativo, máx. ~20% de cada vista | Guia_Gráfica.pdf, "03 · El color" |
| `--grad-orient` … `--grad-acero` | 5 degradados | Fondos y elementos gráficos — nunca sobre el logotipo o el texto | Construidos a partir de la paleta oficial (ver sección "Degradados" del documento) |
| `--font` | `'Ubuntu', system-ui, sans-serif` | Única familia tipográfica del sitio | Guia_Gráfica.pdf, "04 · La tipografía" |
| `--ink`, `--ink-soft`, `--bg`, `--surface`, `--line` | — | Neutros de sistema (texto, fondo, bordes) | Derivados de `--primary`, no vienen del PDF |
| `--r-sm`, `--r-md`, `--r-lg` | 10 / 18 / 26px | Radios de esquina | Definidos para esta guía |

**Regla al editar color:** si cambias `--primary`, revisa después la sección "Botones" del documento en el navegador — el texto blanco de `.btn-primary` y `.bg-primary` necesita contraste suficiente contra el nuevo tono.

## Cómo funciona la sobreescritura de Bootstrap

`kener-styles.css` se carga **después** de `bootstrap.min.css` en el `<head>` del HTML, por eso gana la cascada al repetir un selector. En vez de escribir clases nuevas, se reutilizan los nombres de Bootstrap (`.btn-primary`, `.bg-primary`, `.text-primary`, `.nav-link`, `.card`, `.progress`...) redefiniendo sus variables internas (`--bs-btn-bg`, etc.) con los tokens de marca.

**Qué significa esto en la práctica:** cualquier componente estándar de Bootstrap que agregues más adelante (otro `btn btn-primary`, otro `badge`, otra `card`) ya sale con los colores de Kener sin que tengas que hacer nada — no hace falta duplicar reglas.

## Componentes propios (sin equivalente en Bootstrap)

Bootstrap no trae nada para esto, así que `kener-styles.css` define clases propias. Están agrupadas por sección dentro del archivo (busca el comentario `/* — Nombre de sección — */`):

| Clase | Qué es | Dónde se usa |
|---|---|---|
| `.logo-mark`, `.wordmark`, `#k-mark` (símbolo SVG) | El logotipo K reconstruido en SVG | Navbar, sección "Logotipo", módulo de aplicación |
| `.hero-visual`, `.hero-chip`, `.hero-quote`, `.dna-svg` | Panel degradado de portada con textura de ADN | Hero |
| `.adn-pill` | Tarjetas de valores de marca (Evolución, Cercanía...) | Sección "Identidad" |
| `.swatch-card` / `.swatch-main` | Tarjetas de color — mismo patrón para paleta secundaria y degradados | Sección "Color" |
| `.type-specimen`, `.scale-row` | Tarjetas de especímenes tipográficos y escala | Sección "Tipografía" |
| `.icon-blob` | Blob de degradado con ícono — adaptación de los "Identificadores" 3D del PDF | Sección "Iconografía", módulo de aplicación |
| `.photo-frame`, `.bio-texture` | Marco con recorte de curvas + textura biofuturista | Sección "Fotografía" |
| `.cert-dot` | Puntito decorativo antes de cada certificación | Sección "Confianza", módulo de aplicación |
| `.space-block` | Bloques de muestra para la escala de espaciado/radios | Sección "Espaciado" |
| `.app-mock`, `.app-hero-visual`, `.app-esp-card` | El módulo de homepage de ejemplo | Sección "Aplicación" |

## Agregar una sección nueva

1. En `guia-estilos-kener.html`, copia un bloque `<section id="..." class="py-5">...</section>` existente como plantilla.
2. Cambia el `id`, el número y texto del `.eyebrow`, el título y el contenido.
3. Usa clases de Bootstrap (`row`, `col-*`, `card`, `btn`) para el layout siempre que cubran lo que necesitas — solo crea una clase nueva en `kener-styles.css` si Bootstrap no tiene equivalente.
4. Agrega el enlace correspondiente en la navbar (`<ul class="navbar-nav ...">` al inicio del `<body>`) apuntando a `#tu-id`.

## Dependencias externas

| Recurso | Origen | Notas |
|---|---|---|
| Bootstrap 5.3.3 (CSS + JS bundle) | CDN jsDelivr | Grid, navbar, card, btn, badge, progress |
| Fuente Ubuntu (300/400/500/700 + itálicas) | Google Fonts CDN | Única tipografía del sitio, por definición de marca |

Ambos requieren conexión a internet al abrir el archivo. Para uso interno esto no suele ser un problema; para producción (theme de WordPress), instala Bootstrap y la fuente como assets locales del proyecto.

## Historial

- **v1.0** — Primera versión, CSS embebido en el HTML.
- **v1.1** — Migrada a Bootstrap 5.3; degradados con el mismo formato de tarjeta que la paleta secundaria.
- **v1.2** — CSS separado en `kener-styles.css`; se agrega esta documentación.
