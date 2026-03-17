const express = require('express');
const router = express.Router();

// Importamos tus módulos de lógica
const gun_van = require('../api/modules/gun_van');
const clock = require('../api/modules/clock');

// Endpoint para la Gun Van
router.get('/gunvan', (req, res) => {
    try {
        const data = gun_van.get_gun_van_data();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Endpoint para el Reloj
router.get('/reloj', (req, res) => {
    res.json({
        dia: clock.get_weekday(),
        hora: clock.get_hour_and_minute(),
        clima: clock.get_weather()
    });
});

module.exports = router;
