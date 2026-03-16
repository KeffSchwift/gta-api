const express = require('express');
const router = express.Router();

// Importamos los archivos .js
const vehiculosData = require('../data/vehiculos.js'); 
const logos = require('../data/logos.js');

router.get('/:model', (req, res) => {
    const modelSearch = req.params.model.toLowerCase().trim();
    let v = null;

    // Recorremos las categorías del objeto exportado
    for (const cat in vehiculosData) {
        if (vehiculosData[cat][modelSearch]) {
            v = vehiculosData[cat][modelSearch];
            break;
        }
    }

    if (!v) return res.status(404).json({ error: "No encontrado" });

    // Sacamos el logo usando el fabricante
    const fab = (v.manufacturer || "").toLowerCase().trim();
    const logoUrl = logos[fab] || null;

    // Respuesta limpia
    res.json({
        nombre: v.model || modelSearch,
        precio: v.price ? v.price.toLocaleString() : "N/A",
        logo: logoUrl,
        stats: {
            velocidad: v.speed || 0,
            aceleracion: v.acceleration || 0,
            manejo: v.handling || 0,
            frenado: v.braking || 0
        },
        imagen: v.images?.frontQuarter || v.images?.side || v.image || null
    });
});

module.exports = router;
