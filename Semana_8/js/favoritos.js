const CLAVE = 'multiverso:favoritos';

const esPersonajeValido = (personaje) =>
    personaje !== null &&
    typeof personaje === 'object' &&
    Number.isInteger(personaje.id) &&
    typeof personaje.name === 'string' &&
    typeof personaje.status === 'string' &&
    typeof personaje.species === 'string' &&
    typeof personaje.image === 'string' &&
    typeof personaje.origin?.name === 'string' &&
    typeof personaje.location?.name === 'string';

export const leerFavoritos = () => {
    try {
        const guardados = JSON.parse(
            localStorage.getItem(CLAVE) ?? '[]'
        );

        if (!Array.isArray(guardados)) {
            return [];
        }

        return guardados.filter(esPersonajeValido);
    } catch {
        return [];
    }
};

export const guardarFavoritos = (lista) => {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(lista));
        return true;
    } catch {
        return false;
    }
};

export const esFavorito = (lista, id) =>
    lista.some((favorito) => favorito?.id === id);

export const alternarFavorito = (lista, personaje) => {
    if (!personaje) {
        return lista;
    }

    return esFavorito(lista, personaje.id)
        ? lista.filter((favorito) => favorito?.id !== personaje.id)
        : [...lista, personaje];
};