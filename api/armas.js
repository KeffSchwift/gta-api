const express = require('express');
const router = express.Router();
const armasData = require('../data/armas');

// Cambiamos a '/:nombre?' (el signo ? lo hace opcional)
router.get('/:nombre?', (req, res) => {
    const searchParam = req.params.nombre;

    // --- CASO 1: NO HAY BÚSQUEDA ---
    if (!searchParam) {
        return res.json(armasData);
    }

    // --- CASO 2: HAY BÚSQUEDA (Tu lógica original) ---
    const searchRaw = searchParam.toLowerCase().trim();
    const searchClean = searchRaw.replace(/[\s-.]/g, ''); 

    let mejorCoincidencia = null;
    let categoriaEncontrada = "";
    let maxPuntaje = 0;

    for (const categoria in armasData) {
        for (const id in armasData[categoria]) {
            const arma = armasData[categoria][id];
            const idLimpio = id.replace(/[\s-.]/g, '');
            const nombreLimpio = (arma.nombre || "").toLowerCase().replace(/[\s-.]/g, '');

            // Coincidencia exacta
            if (idLimpio === searchClean || nombreLimpio === searchClean) {
                mejorCoincidencia = { ...arma, idOriginal: id };
                categoriaEncontrada = categoria;
                maxPuntaje = 1;
                break; 
            }

            // Coincidencia parcial
            if (idLimpio.includes(searchClean) || searchClean.includes(idLimpio)) {
                const puntaje = searchClean.length / idLimpio.length;
                if (puntaje > maxPuntaje) {
                    maxPuntaje = puntaje;
                    mejorCoincidencia = { ...arma, idOriginal: id };
                    categoriaEncontrada = categoria;
                }
            }
        }
        if (maxPuntaje === 1) break;
    }

    if (!mejorCoincidencia) return res.status(404).json({ error: "Arma no encontrada" });

    const a = mejorCoincidencia;

    res.json({
        nombre: a.nombre,
        categoria: categoriaEncontrada,
        precio: a.precioGTAOnline > 0 ? `$${a.precioGTAOnline.toLocaleString()}` : "Gratis / N/A",
        desbloqueo: a.nivelDesbloqueo || 0,
        imagen: a.imagen,
        stats: {
            general: a.estadisticas?.general || 0,
            daño: a.estadisticas?.daño || 0,
            cadencia: a.estadisticas?.cadencia || 0,
            precision: a.estadisticas?.precision || 0,
            alcance: a.estadisticas?.alcance || 0
        },
        metadatos: {
            id: a.idOriginal,
            busqueda: maxPuntaje < 1 ? "Aproximado" : "Exacto"
        }
    });
});

module.exports = router;
