# Notas de la API — Multiverso Explorer

## 1. ¿Cuál es la URL de la lista?

https://rickandmortyapi.com/api/character
Esta URL devuelve una lista paginada de personajes.

## 2. ¿Dónde está el array?

La lista se encuentra en la propiedad:
datos.results
Cada elemento de ese array representa un personaje.
Propiedades utilizadas en la aplicación:

- id: identificador del personaje.
- name: nombre.
- status: estado.
- species: especie.
- type: tipo o subtipo.
- gender: género.
- origin.name: origen.
- location.name: ubicación.
- image: URL de la imagen.

## 3. ¿Dónde está la siguiente página?

La siguiente URL se encuentra en:
datos.info.next
Si el valor es null, no hay más páginas.
La URL de la página anterior se encuentra en:
datos.info.prev

## 4. ¿Cada elemento contiene los datos de la tarjeta?

Sí. Cada personaje de datos.results incluye los datos que necesita la tarjeta y el modal.
No necesitamos solicitar un detalle individual ni utilizar Promise.all.

## Archivos del proyecto

- js/api.js: peticiones HTTP y lectura del JSON.
- js/logica.js: filtrado, conteo y búsqueda por ID.
- js/favoritos.js: almacenamiento persistente.
- js/app.js: interfaz, estados, renderizado, eventos y paginación.