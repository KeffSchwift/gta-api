const express = require('express');
const router = express.Router();
const autos = require('../data/autos.json');
const logos = require('../data/logos.json');

router.get('/', (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ msg: "Introduce un modelo o fabricante en el parámetro ?q=" });
    }

    const query = q.toLowerCase().trim();

    const resultados = Object.keys(autos).filter(id => {
        const auto = autos[id];
        return (
            auto.model.toLowerCase().includes(query) ||
            auto.manufacturer.toLowerCase().includes(query)
        );
    }).map(id => {
        const auto = autos[id];
        
        // Buscamos el logo del fabricante
        const fabricanteKey = auto.manufacturer.toLowerCase().trim();
        const logoUrl = logos[fabricanteKey] || null;

        // Extraemos la URL de la imagen sin importar si viene en 'image' o 'images.frontQuarter'
        const urlImagen = auto.images?.frontQuarter || auto.image || "";

        // Creamos un nuevo objeto limpio
        return {
            id: id,
            nombre: auto.model,
            fabricante: auto.manufacturer,
            imagen: urlImagen, // <-- Aquí queda la URL directa
            fabricanteLogo: logoUrl,
            precio: auto.price,
            asientos: auto.seats,
            velocidad_max: auto.topSpeed,
            estadisticas: {
                velocidad: auto.speed,
                aceleracion: auto.acceleration,
                frenado: auto.braking,
                manejo: auto.handling
            }
        };
    });

    if (resultados.length === 0) {
        return res.status(404).json({ msg: "No se encontraron vehículos." });
    }

    res.json(resultados);
});

module.exports = router;
