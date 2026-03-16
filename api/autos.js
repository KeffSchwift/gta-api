const express = require('express');
const router = express.Router();
const autos = require('../data/autos.json');
const logos = require('../data/logos.json');

router.get('/', (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ msg: "Introduce un término de búsqueda en ?q=" });
        }

        const query = q.toLowerCase().trim();

        const resultados = Object.keys(autos).filter(id => {
            const auto = autos[id];
            
            // USAMOS EL OPERADOR ?. PARA EVITAR EL ERROR DE UNDEFINED
            // Si auto.model no existe, devuelve una cadena vacía en lugar de romper la API
            const nombreAuto = (auto?.model || "").toLowerCase();
            const fabricanteAuto = (auto?.manufacturer || "").toLowerCase();
            
            return nombreAuto.includes(query) || fabricanteAuto.includes(query);
        }).map(id => {
            const auto = autos[id];
            
            // Buscamos el logo con seguridad
            const fabricanteRaw = auto?.manufacturer || "";
            const fabricanteKey = fabricanteRaw.toLowerCase().trim();
            const logoUrl = logos[fabricanteKey] || null;

            // Manejo de imagen (soporta ambos formatos que tenías)
            const urlImagen = auto?.images?.frontQuarter || auto?.image || "";

            return {
                id: id,
                nombre: auto?.model || id,
                fabricante: auto?.manufacturer || "Desconocido",
                imagen: urlImagen,
                fabricanteLogo: logoUrl,
                precio: auto?.price || 0,
                asientos: auto?.seats || 0,
                velocidad_max: auto?.topSpeed || { mph: 0, kmh: 0 },
                estadisticas: {
                    velocidad: auto?.speed || 0,
                    aceleracion: auto?.acceleration || 0,
                    frenado: auto?.braking || 0,
                    manejo: auto?.handling || 0
                }
            };
        });

        if (resultados.length === 0) {
            return res.status(404).json({ msg: "No se encontraron vehículos." });
        }

        res.json(resultados);

    } catch (error) {
        console.error("Error en /auto:", error);
        res.status(500).json({ 
            error: "Error interno", 
            mensaje: error.message 
        });
    }
});

module.exports = router;
