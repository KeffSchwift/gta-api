const express = require('express');
const router = express.Router();

// Importación de tu base de datos de vehículos
const vehiculosData = require('../data/vehiculos'); 

/**
 * GET /api/vehiculos/:model
 * Busca por ID, nombre exacto, coincidencia parcial o filtros especiales (imani, hao, drift).
 */
router.get('/:model', (req, res) => {
    const modelParam = req.params.model.toLowerCase().trim();
    
    // Configuración base para la URL absoluta
    // Esto toma el protocolo (http/https) y el host (dominio:puerto) actual
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    // 1. FILTRADO POR MEJORAS ESPECIALES (imani, hao, drift)
    const filtrosEspeciales = {
        'imani': 'imani-tech',
        'hao': 'hsw',
        'drift': 'drift'
    };

    if (filtrosEspeciales[modelParam]) {
        const palabraClave = filtrosEspeciales[modelParam];
        let nombresEncontrados = [];

        for (const cat in vehiculosData) {
            for (const id in vehiculosData[cat]) {
                const v = vehiculosData[cat][id];
                const icono = v.metadatos?.caracteristicas_especiales?.icono || "";
                
                if (icono.includes(palabraClave)) {
                    nombresEncontrados.push(v.nombre);
                }
            }
        }

        return res.json({
            mejora: modelParam.toUpperCase(),
            total: nombresEncontrados.length,
            vehiculos: nombresEncontrados.sort() 
        });
    }

    // 2. LÓGICA DE BÚSQUEDA DE VEHÍCULO ESPECÍFICO
    const modelSearch = modelParam.replace(/[\s-]/g, ''); 
    let mejorCoincidencia = null;
    let maxPuntaje = 0;
    let categoriaEncontrada = "";

    for (const cat in vehiculosData) {
        for (const id in vehiculosData[cat]) {
            const auto = vehiculosData[cat][id];
            
            const idLimpio = id.toLowerCase().replace(/[\s-]/g, '');
            const nombreLimpio = (auto.nombre || "").toLowerCase().replace(/[\s-]/g, '');
            
            if (idLimpio === modelSearch || nombreLimpio === modelSearch) {
                mejorCoincidencia = auto;
                mejorCoincidencia.idOriginal = id;
                categoriaEncontrada = cat;
                maxPuntaje = 1;
                break; 
            }

            if (idLimpio.includes(modelSearch) || nombreLimpio.includes(modelSearch)) {
                const puntaje = modelSearch.length / Math.max(idLimpio.length, nombreLimpio.length);
                if (puntaje > maxPuntaje) {
                    maxPuntaje = puntaje;
                    mejorCoincidencia = auto;
                    mejorCoincidencia.idOriginal = id;
                    categoriaEncontrada = cat;
                }
            }
        }
        if (maxPuntaje === 1) break;
    }

    if (!mejorCoincidencia) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // 3. GENERACIÓN DE URL ABSOLUTA PARA EL LOGO
    const v = mejorCoincidencia;
    const fabricanteRaw = v.metadatos?.fabricante || "";
    const fabricanteClean = fabricanteRaw.toLowerCase().replace(/[\s-]/g, '');
    
    // Generamos la URL completa del logo
    let logoUrl = null;
    if (fabricanteClean && fabricanteClean !== "na") {
        logoUrl = `${baseUrl}/api/assets/${fabricanteClean}.png`;
    }

    // 4. RESPUESTA FINAL CON TODOS LOS DATOS ORIGINALES + CATEGORÍA + URL LOGO
    res.json({
        id_sistema: v.idOriginal,
        categoria: categoriaEncontrada,
        logo_fabricante: logoUrl, // Ahora es una URL completa: http://tuapi.com/api/assets/progen.png
        busqueda_info: maxPuntaje === 1 ? "Coincidencia exacta" : "Resultado aproximado",
        ...v 
    });
});

module.exports = router;
