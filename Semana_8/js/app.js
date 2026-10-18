import { URL_PERSONAJES, obtenerPersonajes } from './api.js';

import {
    filtrarPersonajes,
    contarVivos,
    buscarPorId
} from './logica.js';

import {
    leerFavoritos,
    guardarFavoritos,
    esFavorito,
    alternarFavorito
} from './favoritos.js';

const filtros = {
    texto: '',
    estado: ''
};

let personajes = [];
let favoritos = leerFavoritos();
let siguiente = URL_PERSONAJES;
let cargando = false;
let error = null;
let vista = 'todos';

const ESTADOS = {
    Alive: {
        texto: 'Vivo',
        clases: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    Dead: {
        texto: 'Muerto',
        clases: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
    },
    unknown: {
        texto: 'Desconocido',
        clases: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    }
};

const CLASES_ENLACE = {
    activo: 'block rounded-lg px-3 py-2 font-medium text-indigo-600 md:p-0 dark:text-indigo-400',
    inactivo: 'block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 md:p-0 md:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800'
};

const titulo = document.querySelector('#titulo');
const contador = document.querySelector('#contador');
const grilla = document.querySelector('#grilla');
const btnMas = document.querySelector('#btn-mas');
const formulario = document.querySelector('#form-busqueda');
const inputBusqueda = document.querySelector('#busqueda');
const selectEstado = document.querySelector('#filtro-estado');
const btnMenu = document.querySelector('#btn-menu');
const menu = document.querySelector('#menu');
const modal = document.querySelector('#modal-detalle');
const enlacesVista = document.querySelectorAll('[data-vista]');

const listaActual = () =>
    vista === 'favoritos' ? favoritos : personajes;

const tarjetaHTML = (personaje) => {
    const estado = ESTADOS[personaje.status] ?? ESTADOS.unknown;
    const favorito = esFavorito(favoritos, personaje.id);

    return `
        <article class="relative group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div class="overflow-hidden">
                <img
                    src="${personaje.image}"
                    alt="${personaje.name}"
                    class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105">
            </div>

            <button
                type="button"
                data-fav="${personaje.id}"
                aria-pressed="${favorito}"
                aria-label="${favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                class="absolute top-2 right-2 grid size-10 place-items-center rounded-full bg-white/90 text-2xl shadow transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-900/80 ${favorito ? 'text-rose-600' : 'text-slate-500'}">
                ${favorito ? '♥' : '♡'}
            </button>

            <div class="flex flex-1 flex-col gap-2 p-4">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                    ${personaje.name}
                </h3>

                <span class="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.clases}">
                    ● ${estado.texto}
                </span>

                <p class="text-sm text-slate-500 dark:text-slate-400">
                    ${personaje.species} · ${personaje.origin.name}
                </p>

                <button
                    type="button"
                    data-id="${personaje.id}"
                    class="mt-auto rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Ver detalle
                </button>
            </div>
        </article>
    `;
};

const cerrarMenuMovil = () => {
    if (window.innerWidth < 768) {
        menu.classList.add('hidden');
        btnMenu.setAttribute('aria-expanded', 'false');
        btnMenu.setAttribute('aria-label', 'Abrir menú');
    }
};

const render = () => {
    titulo.textContent = vista === 'favoritos'
        ? 'Tus personajes favoritos'
        : 'Personajes de Rick and Morty';

    enlacesVista.forEach((enlace) => {
        const activo = enlace.dataset.vista === vista;

        enlace.className = activo
            ? CLASES_ENLACE.activo
            : CLASES_ENLACE.inactivo;

        if (activo) {
            enlace.setAttribute('aria-current', 'page');
        } else {
            enlace.removeAttribute('aria-current');
        }
    });

    btnMas.hidden =
        vista === 'favoritos' ||
        siguiente === null ||
        personajes.length === 0;

    btnMas.disabled = cargando;

    btnMas.textContent = cargando
        ? 'Cargando…'
        : error
            ? 'No se pudo cargar. Reintentar'
            : 'Cargar más';

    const sinDatos = vista === 'todos' && personajes.length === 0;

    if (cargando && sinDatos) {
        grilla.innerHTML = `
            <p class="col-span-full animate-pulse rounded-2xl bg-white p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Cargando personajes…
            </p>
        `;

        contador.textContent = '';
        return;
    }

    if (error && sinDatos) {
        grilla.innerHTML = `
            <div class="col-span-full rounded-2xl bg-white p-8 text-center dark:bg-slate-800">
                <p class="font-semibold text-rose-600 dark:text-rose-400">
                    No pudimos cargar los personajes.
                </p>

                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Comprueba tu conexión e inténtalo nuevamente.
                </p>

                <button
                    type="button"
                    data-reintentar
                    class="mt-4 rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white transition hover:bg-indigo-700">
                    Reintentar
                </button>
            </div>
        `;

        contador.textContent = '';
        return;
    }

    const lista = listaActual();
    const visibles = filtrarPersonajes(lista, filtros);

    if (visibles.length === 0) {
        let mensaje;

        if (vista === 'favoritos' && favoritos.length === 0) {
            mensaje = 'Aún no tienes favoritos. Ve a Personajes y pulsa el corazón de una tarjeta.';
        } else if (vista === 'favoritos') {
            mensaje = 'Ningún favorito coincide con la búsqueda.';
        } else {
            mensaje = 'Ningún personaje coincide con la búsqueda.';
        }

        grilla.innerHTML = `
            <p class="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                ${mensaje}
            </p>
        `;
    } else {
        grilla.innerHTML = visibles.map(tarjetaHTML).join('');
    }

    contador.textContent =
        `${visibles.length} de ${lista.length} ${vista === 'favoritos' ? 'favoritos' : 'personajes'} · ${contarVivos(visibles)} vivos`;
};

const abrirDetalle = (personaje) => {
    if (!personaje) return;

    const estado = ESTADOS[personaje.status] ?? ESTADOS.unknown;

    document.querySelector('#modal-nombre').textContent = personaje.name;

    const imagen = document.querySelector('#modal-img');
    imagen.src = personaje.image;
    imagen.alt = personaje.name;

    document.querySelector('#modal-estado').textContent = estado.texto;

    document.querySelector('#modal-especie').textContent =
        personaje.type
            ? `${personaje.species} (${personaje.type})`
            : personaje.species;

    document.querySelector('#modal-origen').textContent =
        personaje.origin.name;

    document.querySelector('#modal-ubicacion').textContent =
        personaje.location.name;

    modal.showModal();
};

btnMenu.addEventListener('click', () => {
    menu.classList.toggle('hidden');

    const abierto = !menu.classList.contains('hidden');

    btnMenu.setAttribute('aria-expanded', String(abierto));
    btnMenu.setAttribute(
        'aria-label',
        abierto ? 'Cerrar menú' : 'Abrir menú'
    );
});

menu.addEventListener('click', (evento) => {
    const enlace = evento.target.closest('a');

    if (!enlace) return;

    cerrarMenuMovil();

    if (!enlace.hasAttribute('data-vista')) {
        return;
    }

    evento.preventDefault();

    vista = enlace.dataset.vista;

    render();

    document.querySelector('#personajes').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

inputBusqueda.addEventListener('input', (evento) => {
    filtros.texto = evento.target.value;
    render();
});

selectEstado.addEventListener('change', (evento) => {
    filtros.estado = evento.target.value;
    render();
});

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
});

grilla.addEventListener('click', (evento) => {
    const botonReintentar = evento.target.closest('[data-reintentar]');

    if (botonReintentar) {
        cargar();
        return;
    }

    const corazon = evento.target.closest('[data-fav]');

    if (corazon) {
        const id = Number(corazon.dataset.fav);

        const personaje =
            buscarPorId(listaActual(), id) ??
            buscarPorId(personajes, id);

        if (!personaje) return;

        favoritos = alternarFavorito(favoritos, personaje);

        if (!guardarFavoritos(favoritos)) {
            console.warn(
                'No se pudieron guardar los favoritos en este navegador.'
            );
        }

        render();
        return;
    }

    const botonDetalle = evento.target.closest('[data-id]');

    if (!botonDetalle) return;

    const id = Number(botonDetalle.dataset.id);

    const personaje =
        buscarPorId(listaActual(), id) ??
        buscarPorId(personajes, id);

    if (personaje) {
        abrirDetalle(personaje);
    }
});

btnMas.addEventListener('click', () => cargar());

modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        modal.close();
    }
});

const cargar = async () => {
    if (cargando || siguiente === null) return;

    cargando = true;
    error = null;
    render();

    try {
        const datos = await obtenerPersonajes(siguiente);

        if (
            !Array.isArray(datos?.results) ||
            !datos?.info ||
            !('next' in datos.info)
        ) {
            throw new Error('La API devolvió una respuesta inesperada.');
        }

        personajes = [...personajes, ...datos.results];
        siguiente = datos.info.next;
    } catch (fallo) {
        error = fallo instanceof Error
            ? fallo.message
            : 'Error desconocido';

        console.error(
            'No se pudieron cargar los personajes:',
            fallo
        );
    } finally {
        cargando = false;
        render();
    }
};

render();
cargar();