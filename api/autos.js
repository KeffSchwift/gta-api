const express = require('express');
const router = express.Router();
const vehiculosData = require('../data/vehiculos'); 
const logos = require('../data/logos');

router.get('/:model', (req, res) => {
    // 1. Normalizamos la búsqueda: quitamos espacios y guiones, y todo a minúsculas
    const searchRaw = req.params.model.toLowerCase();
    const modelSearch = searchRaw.replace(/[\s-]/g, ''); 

    let v = null;
    let idOriginal = "";

    // 2. Buscamos en el JSON comparando contra las llaves también normalizadas
    for (const cat in vehiculosData) {
        // Obtenemos todas las llaves de la categoría (ej: "turismo-omaggio")
        const keys = Object.keys(vehiculosData[cat]);
        
        // Buscamos la llave que al quitarle los guiones coincida con la búsqueda
        const foundKey = keys.find(key => key.replace(/-/g, '') === modelSearch);

        if (foundKey) {
            v = vehiculosData[cat][foundKey];
            idOriginal = foundKey;
            break;
        }
    }

    if (!v) return res.status(404).json({ error: "No encontrado" });

    const nombreFabricante = v.manufacturer || "Desconocido";
    const fabKey = nombreFabricante.toLowerCase().trim();
    const logoUrl = logos[fabKey] || null;

    res.json({
        nombre: v.model || idOriginal,
        fabricante: nombreFabricante,
        asientos: v.seats || "N/A",
        precio: v.price ? v.price.toLocaleString() : "N/A",
        logo: logoUrl,
        kmh: v.topSpeed?.kmh || 0,
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
