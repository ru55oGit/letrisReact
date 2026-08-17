# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]
### Added
- Home: si se llega con `?from=boludeando` en la URL (viene del hub "Dejá de Boludear"), se muestra un botón de volver arriba a la izquierda (blanco, flecha roja, radius 8px) que lleva de vuelta al hub
- Diccionario (ES): agregar "wifi" y "kiwi" a `EXTRA_WORDS_ES` (no están en an-array-of-spanish-words)
### Changed
- AdSense: sacar el script del `index.html` (se cargaba en todo el sitio) y cargarlo solo desde Home y Privacidad (componente `AdsenseScript`) — nunca en `/game`, que es una pantalla de juego sin texto. Mismo fix que en Enganchalo, que Google rechazó por "anuncios servidos por Google en pantallas sin contenido del editor"

### Fixed
- Header: tocar el título (para volver a Home) seleccionaba el texto en mobile y disparaba el popup de "Buscar en Google" del navegador — agregar `userSelect: none`
- Home: agregar emoji de momento del día al saludo (☀️/🌤️/🌙), mismo tratamiento que ya tenía Enganchalo
- Game over: mover los botones "Jugar de nuevo"/"Volver al inicio" debajo del box de palabras encontradas (antes quedaban arriba de todo)

## [2026-07-26]
### Added
- Agregar página de Política de Privacidad (requisito de AdSense)
- AdSense: agregar script, og:url/canonical y ads.txt
- SEO: agregar robots.txt y sitemap.xml (faltaban)

## [2026-07-24]
### Added
- Home: normalizar spacing título/tagline, box cuadrado, y agregar "tiempo sin jugar"
- Sumar profesiones faltantes en el diccionario base (sync con Tuttifrutalo/Enganchalo)
- Sumar nombres propios en español como palabras válidas (sync con Tuttifrutalo/Enganchalo)

## [2026-07-20]
### Added
- Agregar _redirects para el fallback de SPA en Netlify
- Agregar cantidad entre paréntesis al título de Palabras encontradas
### Changed
- Envolver la fila de Nivel/Objetivo en un box con border-radius
- Sistema de niveles, récords independientes, y rediseño de game-over
### Fixed
- Fix: igualar el margen arriba y abajo del box de Nivel
- Fix: el objetivo por nivel ahora crece (5, 10, 15, 20...) en vez de quedar fijo en 5

## [2026-07-19]
### Changed
- Achicar la sopa a 8x14 y agrandar más las letras
- Achicar la sopa a 9x15 y agrandar las letras para que se pueda seleccionar bien en el celular
- Demo de Home: mostrar también que las palabras se pueden encontrar dobladas
- Selección por camino adyacente (no solo línea recta) + bolsa de letras

## [2026-07-18]
### Added
- Bajar velocidad a 1.7s, separar el récord y agregar demo animada en Home
### Changed
- Récord: volver a mejor partida única, no acumular entre partidas
- Mover los puntos al mismo renglón que "Palabras encontradas"
- Permitir rotar la pieza O (cuadrado) y bajar un poco más la velocidad
- Récord: mostrar las palabras encontradas, no solo el conteo
- Récord: acumular puntos y palabras de todas las partidas, no solo la mejor
### Fixed
- Fix layout de controles y bajar la velocidad de caída de piezas

## [2026-07-17]
### Changed
- Letris: Tetris de letras que forma una sopa de letras jugable
