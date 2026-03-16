const express = require('express');
const router = express.Router();
const armas = require('../data/armas.json');

router.get('/', (req, res) => {
    const { q } = req.query;

    // Solo funciona si hay un parámetro de búsqueda
    if (!q) {
        return res.status(400).json({ msg: "Introduce el nombre o tipo de arma en el parámetro ?q=" });
    }

    const query = q.toLowerCase().trim();

    const resultados = Object.keys(armas).filter(id => {
        const arma = armas[id];
        return (
            arma.nombre.toLowerCase().includes(query) ||
            arma.tipo.toLowerCase().includes(query)
        );
    }).map(id => {
        const arma = armas[id];

        // Retornamos un objeto aplanado y limpio en español
        return {
            id: id,
            nombre: arma.nombre,
            tipo: arma.tipo,
            imagen: arma.imagen,
            nivel_desbloqueo: arma.nivelDesbloqueo,
            precio_online: arma.precioGTAOnline,
            estadisticas: {
                daño: arma.estadisticas.daño,
                cadencia: arma.estadisticas.cadencia,
                precision: arma.estadisticas.precision,
                alcance: arma.estadisticas.alcance,
                puntuacion_general: arma.estadisticas.general
            }
        };
    });

    if (resultados.length === 0) {
        return res.status(404).json({ msg: "No se encontraron armas para esta búsqueda." });
    }

    res.json(resultados);
});

module.exports = router;
