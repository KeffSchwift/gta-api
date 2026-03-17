const express = require('express');
const router = express.Router();
const vehiculosData = require('../data/vehiculos'); 
const logos = require('../data/logos');

router.get('/:model', (req, res) => {
    const modelSearch = req.params.model.toLowerCase().trim();
    let v = null;

    for (const cat in vehiculosData) {
        if (vehiculosData[cat][modelSearch]) {
            v = vehiculosData[cat][modelSearch];
            break;
        }
    }

    if (!v) return res.status(404).json({ error: "No encontrado" });

    const fab = (v.manufacturer || "").toLowerCase().trim();
    const logoUrl = logos[fab] || null;

    res.json({
        nombre: v.model || modelSearch,
        precio: v.price ? v.price.toLocaleString() : "N/A",
        logo: logoUrl,
        velkmh: v.topSpeed?.kmh || 0,
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
