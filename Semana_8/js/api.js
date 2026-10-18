export const URL_PERSONAJES =
    'https://rickandmortyapi.com/api/character';

export const pedirJSON = async (url) => {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
    }

    return await respuesta.json();
};

export const obtenerPersonajes = (url) => pedirJSON(url);