const express = require('express');
const router = express.Router();
const armasData = require('../data/armas');

// 1. RUTA PARA LISTAR CATEGORÍAS DISPONIBLES
router.get('/categorias', (req, res) => {
    const listaCategorias = Object.keys(armasData);
    res.json({
        total: listaCategorias.length,
        categorias: listaCategorias
    });
});

// 2. LÓGICA DE BÚSQUEDA (Individual, Categoría o Todo)
const obtenerArmas = (req, res) => {
    const searchParam = req.params.nombre;

    // CASO A: No hay búsqueda -> Devolver todo
    if (!searchParam) {
        return res.json(armasData);
    }

    const searchRaw = searchParam.toLowerCase().trim();
    const searchClean = searchRaw.replace(/[\s-.]/g, '');

    // --- NUEVO --- 
    // CASO B: ¿La búsqueda es una CATEGORÍA? (ej: "pistolas")
    // Buscamos si existe la categoría ignorando mayúsculas y espacios
    const categoriaKey = Object.keys(armasData).find(cat => 
        cat.toLowerCase().replace(/[\s-.]/g, '') === searchClean
    );

    if (categoriaKey) {
        return res.json({
            tipo: "categoria",
            nombre: categoriaKey,
            armas: armasData[categoriaKey]
        });
    }

    // CASO C: La búsqueda es un ARMA (Tu lógica original)
    let mejorCoincidencia = null;
    let categoriaEncontrada = "";
    let maxPuntaje = 0;

    for (const categoria in armasData) {
        for (const id in armasData[categoria]) {
            const arma = armasData[categoria][id];
            const idLimpio = id.replace(/[\s-.]/g, '');
            const nombreLimpio = (arma.nombre || "").toLowerCase().replace(/[\s-.]/g, '');

            if (idLimpio === searchClean || nombreLimpio === searchClean) {
                mejorCoincidencia = { ...arma, idOriginal: id };
                categoriaEncontrada = categoria;
                maxPuntaje = 1;
                break;
            }

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

    if (!mejorCoincidencia) {
        return res.status(404).json({ error: "No se encontró arma ni categoría con ese nombre" });
    }

    // Respuesta para arma individual
    const a = mejorCoincidencia;
    res.json({
        tipo: "arma",
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
        metadatos: { id: a.idOriginal, busqueda: maxPuntaje < 1 ? "Aproximado" : "Exacto" }
    });
};

// 3. RUTAS
router.get('/', obtenerArmas);
router.get('/:nombre', obtenerArmas);

module.exports = router;
