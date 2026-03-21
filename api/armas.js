const express = require('express');
const router = express.Router();
const armasData = require('../data/armas');

// 1. RUTA PARA CATEGORÍAS
router.get('/categorias', (req, res) => {
    res.json({
        total: Object.keys(armasData).length,
        categorias: Object.keys(armasData)
    });
});

// Función para limpiar la respuesta del arma
const infoArma = (a, cat, id) => ({
    nombre: a.nombre,
    categoria: cat,
    precio: a.precioGTAOnline > 0 ? `$${a.precioGTAOnline.toLocaleString()}` : "Gratis",
    desbloqueo: a.nivelDesbloqueo || 0,
    imagen: a.imagen,
    stats: a.estadisticas || {}
});

const obtenerArmas = (req, res) => {
    const searchParam = req.params.nombre;

    // --- CASO: LISTADO TOTAL O CATEGORÍA ---
    const categoriaKey = searchParam ? Object.keys(armasData).find(cat => 
        cat.toLowerCase().replace(/[\s-.]/g, '') === searchParam.toLowerCase().trim().replace(/[\s-.]/g, '')
    ) : null;

    if (!searchParam || categoriaKey) {
        let listaFinal = [];
        let temporal = [];

        if (!searchParam) {
            // Todo el JSON plano
            for (const cat in armasData) {
                for (const id in armasData[cat]) {
                    temporal.push(infoArma(armasData[cat][id], cat, id));
                }
            }
        } else {
            // Solo una categoría
            for (const id in armasData[categoriaKey]) {
                temporal.push(infoArma(armasData[categoriaKey][id], categoriaKey, id));
            }
        }

        // --- EL FORMATO QUE ME PEDISTE ---
        // 1. Metemos el objeto de info en el primer lugar (índice 0)
        listaFinal.push({ 
            total_armas: temporal.length, 
            info: "El listado de armas empieza en el índice 1" 
        });

        // 2. Metemos todas las armas a continuación
        listaFinal.push(...temporal);

        return res.json(listaFinal);
    }

    // --- CASO: BÚSQUEDA POR ÍNDICE (Si el usuario pone un número en la URL) ---
    if (/^\d+$/.test(searchParam)) {
        let todas = [];
        for (const cat in armasData) {
            for (const id in armasData[cat]) {
                todas.push({ ...armasData[cat][id], catName: cat, idOrg: id });
            }
        }
        const a = todas[parseInt(searchParam) - 1]; // /1 devuelve la primera arma real
        return a ? res.json(infoArma(a, a.catName, a.idOrg)) : res.status(404).json({ error: "No existe" });
    }

    res.status(404).json({ error: "No encontrado" });
};

router.get('/', obtenerArmas);
router.get('/:nombre', obtenerArmas);

module.exports = router;
