const express = require('express');
const router = express.Router();

// Almacenamos los juegos usando el ID del usuario como clave
const juegos = new Map();

const FILAS = 6;
const COLUMNAS = 7;
const VACIO = '⬛';
const JUGADOR_1 = '🔴'; // Usuario
const JUGADOR_2 = '🟡'; // Bot

// Crea una matriz vacía de 6x7
const crearTablero = () => Array(FILAS).fill(null).map(() => Array(COLUMNAS).fill(VACIO));

// Verifica si alguien conectó 4
function verificarGanador(tablero, ficha) {
    // Horizontal
    for (let f = 0; f < FILAS; f++) {
        for (let c = 0; c < COLUMNAS - 3; c++) {
            if (tablero[f][c] === ficha && tablero[f][c+1] === ficha && tablero[f][c+2] === ficha && tablero[f][c+3] === ficha) return true;
        }
    }
    // Vertical
    for (let f = 0; f < FILAS - 3; f++) {
        for (let c = 0; c < COLUMNAS; c++) {
            if (tablero[f][c] === ficha && tablero[f+1][c] === ficha && tablero[f+2][c] === ficha && tablero[f+3][c] === ficha) return true;
        }
    }
    // Diagonales
    for (let f = 0; f < FILAS - 3; f++) {
        for (let c = 0; c < COLUMNAS; c++) {
            // Diagonal \
            if (c < COLUMNAS - 3 && tablero[f][c] === ficha && tablero[f+1][c+1] === ficha && tablero[f+2][c+2] === ficha && tablero[f+3][c+3] === ficha) return true;
            // Diagonal /
            if (c >= 3 && tablero[f][c] === ficha && tablero[f+1][c-1] === ficha && tablero[f+2][c-2] === ficha && tablero[f+3][c-3] === ficha) return true;
        }
    }
    return false;
}

// ENDPOINT: Iniciar Juego (Usa el ID del autor que envíes)
router.post('/c4', (req, res) => {
    // En BDFD puedes enviar el authorID en el body o como parámetro
    // Aquí asumimos que lo mandas para identificar la sesión
    const idUsuario = req.body.idUsuario || "global"; 
    
    juegos.set(idUsuario, {
        tablero: crearTablero(),
        ganador: null
    });

    res.json({ idJuego: idUsuario });
});

// ENDPOINT: Movimiento
router.post('/c4/drop/:id', (req, res) => {
    const { id } = req.params; // El ID del usuario
    const { columna, jugador } = req.body;
    
    const juego = juegos.get(id);
    if (!juego) return res.status(404).json({ error: "Juego no iniciado" });

    const ficha = (jugador == 1) ? JUGADOR_1 : JUGADOR_2;
    const colIdx = parseInt(columna);
    let filaColocada = -1;

    // Lógica de gravedad (caer hasta la última fila vacía)
    for (let f = FILAS - 1; f >= 0; f--) {
        if (juego.tablero[f][colIdx] === VACIO) {
            juego.tablero[f][colIdx] = ficha;
            filaColocada = f;
            break;
        }
    }

    if (filaColocada !== -1 && verificarGanador(juego.tablero, ficha)) {
        juego.ganador = jugador;
    }

    // Convertir matriz a string con saltos de línea para BDFD
    const tableroString = juego.tablero.map(f => f.join('')).join('\n');

    res.json({
        tablero: tableroString,
        ganador: juego.ganador || ""
    });
});

module.exports = router;
