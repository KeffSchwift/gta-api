const express = require('express');
const router = express.Router();
const armasData = require('../data/armas'); // Tu archivo con todas las armas por categoría

router.get('/:nombre', (req, res) => {
    const searchRaw = req.params.nombre.toLowerCase().trim();
    // Limpiamos la búsqueda: quitamos espacios, guiones y puntos
    const searchClean = searchRaw.replace(/[\s-.]/g, ''); 

    let mejorCoincidencia = null;
    let categoriaEncontrada = "";
    let maxPuntaje = 0;

    // Recorremos las categorías del objeto
    for (const categoria in armasData) {
        for (const id in armasData[categoria]) {
            const arma = armasData[categoria][id];
            
            // Normalizamos el ID (la llave) y el Nombre para comparar
            const idLimpio = id.replace(/[\s-.]/g, '');
            const nombreLimpio = (arma.nombre || "").toLowerCase().replace(/[\s-.]/g, '');

            // 1. Coincidencia exacta (Prioridad máxima)
            if (idLimpio === searchClean || nombreLimpio === searchClean) {
                mejorCoincidencia = { ...arma, idOriginal: id };
                categoriaEncontrada = categoria;
                maxPuntaje = 1;
                break; 
            }

            // 2. Coincidencia parcial por aproximación
            if (idLimpio.includes(searchClean) || searchClean.includes(idLimpio)) {
                const puntaje = searchClean.length / idLimpio.length;
                if (puntaje > maxPuntaje) {
                    maxPuntaje = puntaje;
                    mejorCoincidencia = { ...arma, idOriginal: id };
                    categoriaEncontrada = categoria;
                }
            }
        }
        if (maxPuntaje === 1) break; // Si ya encontramos el exacto, paramos
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
