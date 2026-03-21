const express = require('express');
const router = express.Router();
const armasData = require('../data/armas');

// 1. RUTA PARA LISTAR CATEGORÍAS
router.get('/categorias', (req, res) => {
    const listaCategorias = Object.keys(armasData);
    res.json({
        total: listaCategorias.length,
        categorias: listaCategorias
    });
});

// LÓGICA DE BÚSQUEDA
const obtenerArmas = (req, res) => {
    const searchParam = req.params.nombre;

    // CASO A: No hay búsqueda -> Todo el JSON
    if (!searchParam) {
        return res.json(armasData);
    }

    const searchRaw = searchParam.toLowerCase().trim();
    const searchClean = searchRaw.replace(/[\s-.]/g, '');

    // --- CASO NÚMEROS (ÍNDICE GLOBAL) ---
    if (/^\d+$/.test(searchClean)) {
        const indice = parseInt(searchClean);
        let todasLasArmas = [];
        for (const cat in armasData) {
            for (const id in armasData[cat]) {
                todasLasArmas.push({ ...armasData[cat][id], idOriginal: id, categoriaPadre: cat });
            }
        }
        const arma = todasLasArmas[indice];
        if (!arma) return res.status(404).json({ error: "Índice fuera de rango" });
        return res.json(formatearArma(arma, arma.categoriaPadre, arma.idOriginal, "Índice"));
    }

    // --- CASO B: BÚSQUEDA POR CATEGORÍA (CON CONTEO AL INICIO) ---
    const categoriaKey = Object.keys(armasData).find(cat => 
        cat.toLowerCase().replace(/[\s-.]/g, '') === searchClean
    );

    if (categoriaKey) {
        const armasDeCategoria = armasData[categoriaKey];
        const total = Object.keys(armasDeCategoria).length;

        // Creamos un objeto nuevo para asegurar que 'total_armas' sea lo primero que aparezca
        const respuesta = {
            total_armas: total,
            ...armasDeCategoria
        };

        return res.json(respuesta); 
    }

    // --- CASO C: BÚSQUEDA POR NOMBRE (Lógica original) ---
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

    if (!mejorCoincidencia) return res.status(404).json({ error: "No encontrado" });

    res.json(formatearArma(mejorCoincidencia, categoriaEncontrada, mejorCoincidencia.idOriginal, maxPuntaje < 1 ? "Aproximado" : "Exacto"));
};

const formatearArma = (a, categoria, id, tipo) => ({
    tipo: "arma",
    nombre: a.nombre,
    categoria: categoria,
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
    metadatos: { id: id, busqueda: tipo }
});

router.get('/', obtenerArmas);
router.get('/:nombre', obtenerArmas);

module.exports = router;
