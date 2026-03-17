const express = require('express');
const router = express.Router();
const armasData = require('../data/armas'); // Asegúrate de que sea .js con module.exports

router.get('/:nombre', (req, res) => {
    const searchRaw = req.params.nombre.toLowerCase().trim();
    // Quitamos espacios, guiones y puntos (ej. "mk.ii" -> "mkii")
    const searchClean = searchRaw.replace(/[\s-.]/g, ''); 

    let mejorCoincidencia = null;
    let maxPuntaje = 0;

    // 1. Buscamos en el objeto de armas
    for (const id in armasData) {
        const arma = armasData[id];
        const idLimpio = id.replace(/[\s-.]/g, '');
        const nombreLimpio = (arma.nombre || "").toLowerCase().replace(/[\s-.]/g, '');

        // Coincidencia exacta
        if (idLimpio === searchClean || nombreLimpio === searchClean) {
            mejorCoincidencia = { ...arma, idOriginal: id };
            maxPuntaje = 1;
            break; 
        }

        // Coincidencia parcial (el que más se parezca)
        if (idLimpio.includes(searchClean) || searchClean.includes(idLimpio)) {
            const puntaje = searchClean.length / idLimpio.length;
            if (puntaje > maxPuntaje) {
                maxPuntaje = puntaje;
                mejorCoincidencia = { ...arma, idOriginal: id };
            }
        }
    }

    if (!mejorCoincidencia) return res.status(404).json({ error: "Arma no encontrada" });

    const a = mejorCoincidencia;

    // Respuesta con estructura similar a la de los autos
    res.json({
        nombre: a.nombre || a.idOriginal,
        tipo: a.tipo || "Varios",
        precio: a.precio_online ? `$${a.precio_online.toLocaleString()}` : "N/A",
        desbloqueo: a.nivel_desbloqueo || 1,
        imagen: a.imagen || null,
        stats: {
            daño: a.estadisticas?.daño || 0,
            cadencia: a.estadisticas?.cadencia || 0,
            precision: a.estadisticas?.precision || 0,
            alcance: a.estadisticas?.alcance || 0
        },
        info: maxPuntaje < 1 ? "Resultado aproximado" : "Coincidencia exacta"
    });
});

module.exports = router;
