const express = require('express');
const router = express.Router();

// Importación de datos
const vehiculosData = require('../data/vehiculos'); 
const logos = require('../data/logos'); 

/**
 * UTILIDADES
 */
const getDaySeed = () => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const seededShuffle = (array, seed) => {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.abs(Math.sin(seed++)) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
};

const mapVehicleData = (cat, id, data) => {
    const fabKey = (data.metadatos?.fabricante || "").toLowerCase().trim();
    return {
        id: id,
        categoria: cat.toUpperCase(),
        logo_fabricante: logos[fabKey] || null,
        nombre: data.nombre,
        imagen: data.imagen,
        fabricante: data.metadatos?.fabricante || "Desconocido",
        rendimiento: data.rendimiento?.estadisticas?.general || 0,
        precio: data.precio_online || "N/A"
    };
};

// --- ENDPOINTS ---

/**
 * 1. CONCESIONARIOS (Solo Terrestres: Premium 5 / Lujo 2)
 */
router.get('/shop', (req, res) => {
    const seed = getDaySeed();
    let poolNormal = [];
    let poolLujo = [];

    // Filtro para asegurar que solo aparezcan vehículos de tierra
    const catsExcluidas = ['planes', 'helicopters', 'boats', 'submarines'];

    for (const cat in vehiculosData) {
        if (catsExcluidas.includes(cat.toLowerCase())) continue;

        for (const id in vehiculosData[cat]) {
            const v = mapVehicleData(cat, id, vehiculosData[cat][id]);
            if (cat.toLowerCase() === 'super') {
                poolLujo.push(v);
            } else {
                poolNormal.push(v);
            }
        }
    }

    res.json({
        fecha: new Date().toISOString().split('T')[0],
        concesionario_premium: seededShuffle([...poolNormal], seed).slice(0, 5),
        concesionario_lujo: seededShuffle([...poolLujo], seed + 1).slice(0, 2)
    });
});

/**
 * 2. EXPORTACIONES (8 vehículos diarios)
 */
router.get('/exportar', (req, res) => {
    const seed = getDaySeed() + 99;
    let totalPool = [];
    for (const cat in vehiculosData) {
        for (const id in vehiculosData[cat]) {
            totalPool.push(mapVehicleData(cat, id, vehiculosData[cat][id]));
        }
    }
    res.json({
        objetivos: seededShuffle(totalPool, seed).slice(0, 8)
    });
});

/**
 * 3. ROBO DE CALLE (Verifica si es exportación)
 */
router.get('/robar', (req, res) => {
    const categoriasCalle = ['sedans', 'compacts', 'coupes', 'suvs', 'muscles', 'sports'];
    let poolCalle = [];
    for (const cat of categoriasCalle) {
        if (vehiculosData[cat]) {
            for (const id in vehiculosData[cat]) {
                poolCalle.push(mapVehicleData(cat, id, vehiculosData[cat][id]));
            }
        }
    }
    
    if (poolCalle.length === 0) return res.status(500).json({ error: "No hay vehículos en el pool de calle" });

    const autoEncontrado = poolCalle[Math.floor(Math.random() * poolCalle.length)];

    // Lógica de exportación para verificar el objetivo
    const seedExport = getDaySeed() + 99;
    let exportPool = [];
    for (const cat in vehiculosData) {
        for (const id in vehiculosData[cat]) {
            exportPool.push(mapVehicleData(cat, id, vehiculosData[cat][id]));
        }
    }
    const listaHoy = seededShuffle(exportPool, seedExport).slice(0, 8);
    const esObjetivo = listaHoy.some(obj => obj.id === autoEncontrado.id);

    res.json({
        notificacion: esObjetivo ? "⚠️ ¡OBJETIVO DE EXPORTACIÓN!" : "Vehículo robado.",
        es_objetivo: esObjetivo,
        vehiculo: autoEncontrado
    });
});

/**
 * 4. BUSCADOR GLOBAL (Busca por nombre o ID en toda la DB)
 */
router.get('/buscar', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase().trim() : '';
    if (!query) return res.status(400).json({ error: "Falta el parámetro de búsqueda (?q=...)" });

    let resultados = [];

    for (const cat in vehiculosData) {
        for (const id in vehiculosData[cat]) {
            const v = vehiculosData[cat][id];
            // Match por nombre o por ID exacto
            if (v.nombre.toLowerCase().includes(query) || id.toLowerCase() === query) {
                resultados.push(mapVehicleData(cat, id, v));
            }
        }
    }

    res.json({
        termino: query,
        cantidad: resultados.length,
        resultados: resultados
    });
});

/**
 * 5. BUSCADOR POR CATEGORÍA
 */
router.get('/categoria/:catName', (req, res) => {
    const catParam = req.params.catName.toLowerCase().trim();
    if (!vehiculosData[catParam]) return res.status(404).json({ error: "No existe la categoría" });

    let pool = [];
    for (const id in vehiculosData[catParam]) {
        pool.push(mapVehicleData(catParam, id, vehiculosData[catParam][id]));
    }

    // 4 aleatorios
    const seleccion = pool.sort(() => 0.5 - Math.random()).slice(0, 4);

    res.json({
        categoria: catParam.toUpperCase(),
        vehiculos: seleccion
    });
});

module.exports = router;
