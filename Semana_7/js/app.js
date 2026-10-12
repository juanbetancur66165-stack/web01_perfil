
import { personajes } from './datos.js';
import {
    filtrarPersonajes,
    contarVivos,
    buscarPorId
} from './logica.js';

const filtros = {
    texto: '',
    estado: ''
};

const ESTADOS = {
    Alive: {
        texto: 'Vivo',
        clases: 'bg-emerald-100 text-emerald-700'
    },
    Dead: {
        texto: 'Muerto',
        clases: 'bg-rose-100 text-rose-700'
    },
    unknown: {
        texto: 'Desconocido',
        clases: 'bg-slate-200 text-slate-600'
    }
};

const grilla = document.querySelector('#grilla');
const contador = document.querySelector('#contador');
const formulario = document.querySelector('#form-busqueda');
const busqueda = document.querySelector('#busqueda');
const filtroEstado = document.querySelector('#filtro-estado');
const modal = document.querySelector('#modal-detalle');
const btnMenu = document.querySelector('#btn-menu');
const menu = document.querySelector('#menu');

function tarjetaHTML(personaje) {
    const estado = ESTADOS[personaje.status] || ESTADOS.unknown;

    const especie = personaje.type
        ? `${personaje.species} (${personaje.type})`
        : personaje.species;

    return `
        <article class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800">
            <div class="overflow-hidden">
                <img
                    src="${personaje.image}"
                    alt="${personaje.name}"
                    class="aspect-square w-full object-cover transition group-hover:scale-105">
            </div>

            <div class="flex flex-1 flex-col gap-2 p-4">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                    ${personaje.name}
                </h3>

                <span class="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.clases}">
                    ● ${estado.texto}
                </span>

                <p class="text-sm text-slate-500 dark:text-slate-400">
                    ${especie} · ${personaje.origin.name}
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
}

function render() {
    const visibles = filtrarPersonajes(personajes, filtros);

    if (visibles.length === 0) {
        grilla.classList.remove('sm:grid-cols-2', 'lg:grid-cols-4');

        grilla.innerHTML = `
            <p class="rounded-2xl bg-white p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Ningún personaje coincide con la búsqueda.
            </p>
        `;
    } else {
        grilla.classList.add('sm:grid-cols-2', 'lg:grid-cols-4');
        grilla.innerHTML = visibles.map(tarjetaHTML).join('');
    }

    contador.textContent =
        `${visibles.length} de ${personajes.length} personajes · ${contarVivos(visibles)} vivos`;
}

function abrirDetalle(personaje) {
    if (!personaje) return;

    const estado = ESTADOS[personaje.status] || ESTADOS.unknown;

    document.querySelector('#modal-nombre').textContent = personaje.name;

    const imagen = document.querySelector('#modal-img');
    imagen.src = personaje.image;
    imagen.alt = personaje.name;

    document.querySelector('#modal-estado').textContent = estado.texto;

    document.querySelector('#modal-especie').textContent = personaje.type
        ? `${personaje.species} (${personaje.type})`
        : personaje.species;

    document.querySelector('#modal-origen').textContent = personaje.origin.name;
    document.querySelector('#modal-ubicacion').textContent = personaje.location.name;

    modal.showModal();
}

btnMenu.addEventListener('click', () => {
    menu.classList.toggle('hidden');

    const abierto = !menu.classList.contains('hidden');

    btnMenu.setAttribute('aria-expanded', abierto);
    btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
});

menu.querySelectorAll('a').forEach((enlace) => {
    enlace.addEventListener('click', () => {
        if (window.innerWidth < 768) {
            menu.classList.add('hidden');
            btnMenu.setAttribute('aria-expanded', 'false');
            btnMenu.setAttribute('aria-label', 'Abrir menú');
        }
    });
});

busqueda.addEventListener('input', (evento) => {
    filtros.texto = evento.target.value;
    render();
});

filtroEstado.addEventListener('change', (evento) => {
    filtros.estado = evento.target.value;
    render();
});

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
});

grilla.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-id]');

    if (!boton) return;

    const personaje = buscarPorId(personajes, Number(boton.dataset.id));

    abrirDetalle(personaje);
});

modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        modal.close();
    }
});

render();
