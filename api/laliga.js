const express = require('express');
const router = express.Router();

let cacheData = null;
let lastUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const generarTablaASCII = (tabla) => {
    // Definimos los anchos de columna
    const w = { pos: 3, equipo: 18, pts: 3, dg: 3 };
    
    // Encabezado con separadores rectos para mayor limpieza
    let ascii = ` #  | ${"EQUIPO".padEnd(w.equipo)} | PTS | DG \n`;
    ascii += `----|${"-".repeat(w.equipo + 2)}|-----|----\n`;
    
    tabla.forEach(e => {
        const pos = e.pos.toString().padStart(2, ' ').padEnd(w.pos, ' ');
        // Cortamos el nombre si es muy largo para que no rompa la línea
        const nombre = e.equipo.substring(0, w.equipo).padEnd(w.equipo, ' ');
        const pts = e.pts.toString().padStart(3, ' ');
        const dg = e.dg.toString().padStart(3, ' ');
        
        ascii += `${pos} | ${nombre} | ${pts} | ${dg}\n`;
    });
    
    return ascii;
};

router.get('/', async (req, res) => {
    const now = Date.now();

    if (!cacheData || (now - lastUpdate > CACHE_DURATION)) {
        try {
            const response = await fetch('http://api.football-data.org/v4/competitions/PD/standings', {
                headers: { 'X-Auth-Token': '9fb4b27d0a23448d9a7cc91579b97696' }
            });

            const rawData = await response.json();
            const tablaAbreviada = rawData.standings[0].table.map(item => ({
                pos: item.position,
                equipo: item.team.shortName,
                pts: item.points,
                dg: item.goalDifference
            }));

            // Guardamos solo el string de la tabla
            cacheData = generarTablaASCII(tablaAbreviada);
            lastUpdate = now;

        } catch (error) {
            if (!cacheData) return res.status(500).send("Error al obtener datos.");
        }
    }

    // Enviamos la respuesta como TEXTO PLANO para que se vea directo la tabla
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(cacheData);
});

module.exports = router;
 
