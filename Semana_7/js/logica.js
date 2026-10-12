
export function filtrarPersonajes(lista, filtros) {
    const nombreBuscado = filtros.texto.trim().toLowerCase();
    const estadoBuscado = filtros.estado.toLowerCase();

    return lista.filter((personaje) => {
        const coincideNombre = personaje.name
            .toLowerCase()
            .includes(nombreBuscado);

        const coincideEstado =
            estadoBuscado === '' ||
            personaje.status.toLowerCase() === estadoBuscado;

        return coincideNombre && coincideEstado;
    });
}

export function contarVivos(lista) {
    return lista.filter((personaje) => personaje.status === 'Alive').length;
}

export function buscarPorId(lista, id) {
    return lista.find((personaje) => personaje.id === id);
}
