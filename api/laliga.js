const express = require('express');
const router = express.Router();

// Objeto de caché multidimensional (una entrada por cada liga solicitada)
const cache = {}; 
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const generarTablaASCII = (ligaNombre, tabla) => {
    const w = { pos: 2, equipo: 15, pts: 2, dg: 2 };
    let ascii = `P. | EQUIPO          | PT | DG\n`;
    ascii += `---|-----------------|----|----\n`;
    
    tabla.forEach(e => {
        const pos = e.pos.toString().padStart(w.pos, '0');
        const nombre = (e.equipo || "S/N").substring(0, w.equipo).padEnd(w.equipo, ' ');
        const pts = (e.pts ?? 0).toString().padStart(w.pts, ' ');
        const dg = (e.dg ?? 0).toString().padStart(w.dg, ' ');
        ascii += `${pos} | ${nombre} | ${pts} | ${dg}\n`;
    });
    return ascii;
};

// Endpoint: /gta/posiciones/:league (ej: /gta/posiciones/PD, /gta/posiciones/CL, /gta/posiciones/BSA)
router.get('/:league', async (req, res) => {
    const leagueCode = req.params.league.toUpperCase();
    const now = Date.now();

    // Verificamos si existe caché para esta liga específica y si sigue vigente
    if (!cache[leagueCode] || (now - cache[leagueCode].lastUpdate > CACHE_DURATION)) {
        try {
            console.log(`[LOG] Actualizando datos para: ${leagueCode}`);
            
            const response = await fetch(`http://api.football-data.org/v4/competitions/${leagueCode}/standings`, {
                headers: { 'X-Auth-Token': '9fb4b27d0a23448d9a7cc91579b97696' }
            });

            if (!response.ok) throw new Error('No se pudo obtener la liga');

            const rawData = await response.json();
            
            // Extraemos los datos de la tabla (standings[0] suele ser la tabla general)
            const standings = rawData.standings[0].table.map(item => ({
                pos: item.position,
                equipo: item.team.shortName || item.team.name,
                pts: item.points,
                dg: item.goalDifference
            }));

            // Guardamos en caché usando el código de la liga como clave única
            cache[leagueCode] = {
                data: generarTablaASCII(rawData.competition.name, standings),
                lastUpdate: now
            };

        } catch (error) {
            // Si la API falla pero tenemos datos viejos en caché, los enviamos. Si no, error.
            if (!cache[leagueCode]) {
                return res.status(404).send(`Error: El codigo '${leagueCode}' no es una liga valida o no esta disponible.`);
            }
        }
    }

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(cache[leagueCode].data);
});

module.exports = router;
