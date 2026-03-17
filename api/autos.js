const express = require('express');
const router = express.Router();
const vehiculosData = require('../data/vehiculos'); 
const logos = require('../data/logos');

router.get('/:model', (req, res) => {
    const searchRaw = req.params.model.toLowerCase().trim();
    const modelSearch = searchRaw.replace(/[\s-]/g, ''); 

    let mejorCoincidencia = null;
    let maxPuntaje = 0;

    for (const cat in vehiculosData) {
        for (const id in vehiculosData[cat]) {
            const auto = vehiculosData[cat][id];
            const idLimpio = id.replace(/-/g, '');
            const nombreLimpio = (auto.model || "").toLowerCase().replace(/[\s-]/g, '');
            
            if (idLimpio === modelSearch || nombreLimpio === modelSearch) {
                mejorCoincidencia = auto;
                mejorCoincidencia.idOriginal = id;
                break; 
            }

            if (idLimpio.includes(modelSearch) || modelSearch.includes(idLimpio)) {
                const puntaje = modelSearch.length / idLimpio.length;
                if (puntaje > maxPuntaje) {
                    maxPuntaje = puntaje;
                    mejorCoincidencia = auto;
                    mejorCoincidencia.idOriginal = id;
                }
            }
        }
        if (mejorCoincidencia && maxPuntaje === 1) break;
    }

    if (!mejorCoincidencia) return res.status(404).json({ error: "No se encontró nada parecido" });

    const v = mejorCoincidencia;
    const fabKey = (v.manufacturer || "").toLowerCase().trim();

    res.json({
        nombre: v.model || v.idOriginal,
        fabricante: v.manufacturer || "Desconocido",
        asientos: v.seats || "N/A",
        precio: v.price ? v.price.toLocaleString() : "N/A",
        logo: logos[fabKey] || null,
        topSpeed: {
            mph: v.topSpeed?.mph || 0,
            kmh: v.topSpeed?.kmh || 0
        },
        stats: {
            velocidad: v.speed || 0,
            aceleracion: v.acceleration || 0,
            manejo: v.handling || 0,
            frenado: v.braking || 0
        },
        imagen: v.images?.frontQuarter || v.images?.side || v.image || null,
        busqueda_info: maxPuntaje < 1 ? "Resultado aproximado" : "Coincidencia exacta"
    });
});

module.exports = router;
