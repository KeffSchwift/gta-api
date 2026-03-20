const express = require('express');
const router = express.Router();

// Importación de datos
const vehiculosData = require('../data/vehiculos'); 
const logos = require('../data/logos'); // Importamos de nuevo tu mapeo de links

/**
 * GET /api/vehiculos/:model
 */
router.get('/:model', (req, res) => {
    const modelParam = req.params.model.toLowerCase().trim();
    
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
            
            // Coincidencia Exacta
            if (idLimpio === modelSearch || nombreLimpio === modelSearch) {
                mejorCoincidencia = auto;
                mejorCoincidencia.idOriginal = id;
                categoriaEncontrada = cat;
                maxPuntaje = 1;
                break; 
            }

            // Coincidencia Parcial
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

    // 3. OBTENCIÓN DEL LOGO DESDE EL OBJETO DE LINKS
    const v = mejorCoincidencia;
    const fabKey = (v.metadatos?.fabricante || "").toLowerCase().trim();
    const logoUrl = logos[fabKey] || null; // Busca el link en tu archivo logos.js

    // 4. RESPUESTA FINAL COMPLETA
    res.json({
        id_sistema: v.idOriginal,
        categoria: categoriaEncontrada,
        logo_fabricante: logoUrl, // Vuelve a ser el link directo (URL) de tu data/logos
        busqueda_info: maxPuntaje === 1 ? "Coincidencia exacta" : "Resultado aproximado",
        ...v // Esparce todo el contenido original del JSON
    });
});

module.exports = router;
