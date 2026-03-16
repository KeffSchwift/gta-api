const express = require('express');
const router = express.Router();
const autos = require('../data/autos.json');
const logos = require('../data/logos.json');

router.get('/', (req, res) => {
    const { q } = req.query;

    if (!q) return res.status(400).json({ msg: "Pon un modelo en ?q=" });

    const query = q.toLowerCase().trim();

    const resultados = Object.keys(autos)
        .filter(id => {
            const modelo = autos[id]?.model || "";
            return modelo.toLowerCase().includes(query);
        })
        .map(id => {
            const auto = autos[id];
            const fab = (auto?.manufacturer || "").toLowerCase().trim();
            
            return {
                id: id,
                nombre: auto?.model || id,
                fabricante: auto?.manufacturer || "",
                imagen: auto?.images?.frontQuarter || auto?.image || "",
                fabricanteLogo: logos[fab] || null,
                precio: auto?.price || 0,
                estadisticas: {
                    velocidad: auto?.speed || 0,
                    aceleracion: auto?.acceleration || 0,
                    frenado: auto?.braking || 0,
                    manejo: auto?.handling || 0
                }
            };
        });

    if (resultados.length === 0) return res.status(404).json({ msg: "No hay nada" });

    res.json(resultados);
});

module.exports = router;
