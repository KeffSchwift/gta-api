const express = require('express');
const router = express.Router();

const LIGAS_INFO = {
    "PD": { "nombre": "🇪🇸 LaLiga", "hex": "#EE252E", "emblema": "https://crests.football-data.org/laliga.png" },
    "PL": { "nombre": "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League", "hex": "#3D195B", "emblema": "https://crests.football-data.org/PL.png" },
    "BL1": { "nombre": "🇩🇪 Bundesliga", "hex": "#D3010C", "emblema": "https://crests.football-data.org/BL1.png" },
    "SA": { "nombre": "🇮🇹 Serie A", "hex": "#008FD7", "emblema": "https://crests.football-data.org/c111.png" },
    "FL1": { "nombre": "🇫🇷 Ligue 1", "hex": "#DAE025", "emblema": "https://crests.football-data.org/FL1.png" },
    "DED": { "nombre": "🇳🇱 Eredivisie", "hex": "#F5941C", "emblema": "https://crests.football-data.org/ED.png" },
    "PPL": { "nombre": "🇵🇹 Primeira Liga", "hex": "#EDBB3F", "emblema": "https://crests.football-data.org/PPL.png" },
    "BSA": { "nombre": "🇧🇷 Série A", "hex": "#009540", "emblema": "https://crests.football-data.org/bsa.png" },
    "CL": { "nombre": "🇪🇺 UEFA Champions League", "hex": "#003399", "emblema": "https://crests.football-data.org/CL.png" }
};

const cache = {}; 
const CACHE_DURATION = 5 * 60 * 1000;

const generarTablaASCII = (tabla) => {
    // Definimos anchos fijos estrictos
    const w = { pos: 2, equipo: 15, pts: 2, dg: 3 };
    
    // Encabezado alineado con las filas
    let ascii = `P.|EQUIPO         |PT|DG \n`;
    ascii += `--|---------------|--|---\n`;
    
    tabla.forEach(e => {
        const pos = e.pos.toString().padStart(w.pos, '0');
        const nombre = (e.equipo || "S/N").substring(0, w.equipo).padEnd(w.equipo, ' ');
        const pts = (e.pts ?? 0).toString().padStart(w.pts, ' ');
        // La diferencia de goles suele ser de 3 caracteres (ej: -10 o 100)
        const dg = (e.dg ?? 0).toString().padStart(w.dg, ' ');
        
        ascii += `${pos}|${nombre}|${pts}|${dg}\n`;
    });
    return ascii;
};

router.get('/:league', async (req, res) => {
    const leagueCode = req.params.league.toUpperCase();
    const now = Date.now();

    const infoExtra = LIGAS_INFO[leagueCode] || { nombre: leagueCode, hex: "#FFFFFF", emblema: "" };

    if (!cache[leagueCode] || (now - cache[leagueCode].lastUpdate > CACHE_DURATION)) {
        try {
            const response = await fetch(`http://api.football-data.org/v4/competitions/${leagueCode}/standings`, {
                headers: { 'X-Auth-Token': '9fb4b27d0a23448d9a7cc91579b97696' }
            });

            if (!response.ok) throw new Error();

            const rawData = await response.json();
            const standings = rawData.standings[0].table.map(item => ({
                pos: item.position,
                equipo: item.team.shortName || item.team.name,
                pts: item.points,
                dg: item.goalDifference
            }));

            cache[leagueCode] = {
                ascii: generarTablaASCII(standings),
                lastUpdate: now
            };

        } catch (error) {
            if (!cache[leagueCode]) {
                return res.status(404).json({ error: `Liga '${leagueCode}' no encontrada.` });
            }
        }
    }

    res.json({
        nombre: infoExtra.nombre,
        hex: infoExtra.hex,
        emblema: infoExtra.emblema,
        tabla_ascii: cache[leagueCode].ascii
    });
});

module.exports = router;
