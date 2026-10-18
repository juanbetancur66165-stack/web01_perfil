export const filtrarPersonajes = (lista, filtros) => {
    const texto = (filtros.texto ?? '').trim().toLowerCase();
    const estado = (filtros.estado ?? '').toLowerCase();

    return lista
        .filter((personaje) =>
            personaje.name.toLowerCase().includes(texto)
        )
        .filter((personaje) =>
            estado === '' ||
            personaje.status.toLowerCase() === estado
        );
};

export const contarVivos = (lista) =>
    lista.reduce((total, personaje) =>
        personaje.status === 'Alive' ? total + 1 : total, 0
    );

export const buscarPorId = (lista, id) =>
    lista.find((personaje) => personaje.id === id);