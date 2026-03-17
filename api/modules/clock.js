const tunables = require('../util/tunables.js');

const WEATHERS = {
    0: '⛅ Parcialmente nublado',
    4: '🌫️ Neblina',
    7: '☁️ Mayormente nublado',
    11: '☀️ Despejado',
    14: '🌫️ Neblina',
    16: '☀️ Despejado',
    28: '🌫️ Neblina',
    31: '☀️ Despejado',
    41: '😶‍🌫️ Brumoso',
    45: '⛅ Parcialmente nublado',
    52: '🌫️ Neblina',
    55: '☁️ Nublado',
    62: '🌫️ Niebla',
    66: '☁️ Nublado',
    72: '⛅ Parcialmente nublado',
    78: '🌫️ Niebla',
    82: '☁️ Nublado',
    92: '🌤️ Mayormente despejado',
    104: '⛅ Parcialmente nublado',
    105: '🌦️ Llovizna',
    108: '⛅ Parcialmente nublado',
    125: '🌫️ Neblina',
    128: '⛅ Parcialmente nublado',
    131: '🌧️ Lloviendo',
    134: '🌦️ Llovizna',
    137: '☁️ Nublado',
    148: '🌫️ Neblina',
    151: '☁️ Mayormente nublado',
    155: '🌫️ Niebla',
    159: '☀️ Despejado',
    176: '🌤️ Mayormente despejado',
    196: '🌫️ Niebla',
    201: '⛅ Parcialmente nublado',
    220: '🌫️ Neblina',
    222: '🌤️ Mayormente despejado',
    244: '🌫️ Neblina',
    246: '🌤️ Mayormente despejado',
    247: '🌧️ Lloviendo',
    250: '🌦️ Llovizna',
    252: '⛅ Parcialmente nublado',
    268: '🌫️ Neblina',
    270: '⛅ Parcialmente nublado',
    272: '☁️ Nublado',
    277: '⛅ Parcialmente nublado',
    292: '🌫️ Neblina',
    295: '⛅ Parcialmente nublado',
    300: '☁️ Mayormente nublado',
    306: '⛅ Parcialmente nublado',
    318: '☁️ Mayormente nublado',
    330: '⛅ Parcialmente nublado',
    337: '☀️ Despejado',
    367: '⛅ Parcialmente nublado',
    369: '🌧️ Lloviendo',
    376: '🌦️ Llovizna',
    377: '⛅ Parcialmente nublado'
};

const WEEKDAYS = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

function get_weekday() {
    let timestamp = Math.floor(new Date() / 1000);
    let weekday_correction = Math.floor((timestamp) / (365 * 2880)) % 7;
    let weekday = WEEKDAYS[Math.floor(timestamp / 2880 + 2 - weekday_correction) % 7];

    return weekday;
}

function get_hour_and_minute() {
    let timestamp = Math.floor(new Date() / 1000);
    let hour = Math.floor(timestamp / 120) % 24;
    let minute = Math.floor(timestamp / 2) % 60;
    let formatted_hour = hour < 10 ? '0' + hour : hour.toString();
    let formatted_minute = minute < 10 ? '0' + minute : minute.toString();

    return formatted_hour + ':' + formatted_minute;
}

function get_weather() {
    let snow_tunable = tunables.get_tunable('TURN_SNOW_ON_OFF');
    if (snow_tunable !== 'invalid' && snow_tunable) {
        return 'Invierno';
    }

    let halloween_tunable = tunables.get_tunable('SSP2WEATHER');
    if (halloween_tunable !== 'invalid' && halloween_tunable) {
        return 'Halloween';
    }

    let timestamp = Math.floor(new Date() / 1000);
    let weather_period = timestamp / 120 % 384;
    let weather = WEATHERS[Object.keys(WEATHERS).filter(i => i <= weather_period).reverse()[0]];

    return weather;
}


module.exports = {
    get_weekday,
    get_hour_and_minute,
    get_weather
};
