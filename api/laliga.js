const express = require('express');
const router = express.Router();

let cacheData = null;
let lastUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const generarTablaASCII = (tabla) => {
    // Definimos anchos mínimos para mantener todo pegado
    const w = { pos: 2, equipo: 15, pts: 2, dg: 2 };
    
    // Encabezado ultra-compacto
    let ascii = `P.|EQUIPO         |PT|DG\n`;
    ascii += `--|---------------|--|--\n`;
    
    tabla.forEach(e => {
        // padStart/padEnd con los valores exactos para evitar huecos
        const pos = e.pos.toString().padStart(w.pos, '0');
        const nombre = e.equipo.substring(0, w.equipo).padEnd(w.equipo, ' ');
        const pts = e.pts.toString().padStart(w.pts, ' ');
        const dg = e.dg.toString().padStart(w.dg, ' ');
        
        ascii += `${pos}|${nombre}|${pts}|${dg}\n`;
    });
    
    return ascii;
};

router.get('/posiciones', async (req, res) => {
    const now = Date.now();

    if (!cacheData || (now - lastUpdate > CACHE_DURATION)) {
        try {
            const response = await fetch('http://api.football-data.org/v4/competitions/PD/standings', {
                headers: { 'X-Auth-Token': '9fb4b27d0a23448d9a7cc91579b97696' }
            });

            if (!response.ok) throw new Error();

            const rawData = await response.json();
            const datosCucinados = rawData.standings[0].table.map(item => ({
                pos: item.position,
                equipo: item.team.shortName,
                pts: item.points,
                dg: item.goalDifference
            }));

            cacheData = generarTablaASCII(datosCucinados);
            lastUpdate = now;
        } catch (e) {
            if (!cacheData) return res.status(500).send("Error");
        }
    }

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(cacheData);
});

module.exports = router;
