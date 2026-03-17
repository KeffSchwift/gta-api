const seed_random_number_generator = require('../util/rng.js');
const misc = require('../util/misc.js');
const tunables = require('../util/tunables.js');
const zones = require('../data/zones.json');

const DISABLED_LOCATION = 4;

const ARMOR_NAMES = {
    6: "Blindaje súper ligero",
    7: "Blindaje ligero",
    8: "Blindaje estándar",
    9: "Blindaje pesado",
    10: "Blindaje súper pesado"
};

function get_gun_van_location() {
    let rng = new seed_random_number_generator(misc.get_seed_value());
    let iVar0 = rng.get_random_int_ranged(0n, (30n - 1n));

    while (iVar0 === DISABLED_LOCATION) {
        iVar0 = rng.get_random_int_ranged(0n, (30n - 1n));
    }
    return iVar0;
}

// Cambiamos el nombre aquí para que coincida con tu bot.js
function get_gun_van_data() {
    let loc = get_gun_van_location();
    
    let zone_name = zones.gun_van[loc];
    let map_image = zones.gv_map[loc]; 

    let inventory_text = ``;

    // Armas e Identificación de blindajes
    for (let i = 0; i <= 9; i++) {
        let weapon_name = tunables.get_tunable('XM22_GUN_VAN_SLOT_WEAPON_TYPE_' + i);
        let discount = tunables.get_tunable('XM22_GUN_VAN_SLOT_WEAPON_DISCOUNT_' + i);
        
        if (weapon_name !== null && weapon_name !== 'invalid') {
            let final_name = (weapon_name === 0 || weapon_name === "0") 
                ? ARMOR_NAMES[i] || "Blindaje corporal" 
                : weapon_name;
            
            inventory_text += `- ${final_name} (${discount * 100}%)\n`;
        }
    }

    // Arrojadizos
    inventory_text += `\nArrojables:\n`;
    for (let i = 0; i <= 2; i++) {
        let throwable_name = tunables.get_tunable('XM22_GUN_VAN_SLOT_THROWABLE_TYPE_' + i);
        let discount = tunables.get_tunable('XM22_GUN_VAN_SLOT_THROWABLE_DISCOUNT_' + i);
        if (throwable_name !== null && throwable_name !== 'invalid') {
            inventory_text += `- ${throwable_name} (${discount * 100}%)\n`;
        }
    }

    return {
        location: zone_name,
        image_url: map_image, // Tu link puro para manipularlo
        message: inventory_text
    };
}

module.exports = {
    create_gun_van_message: get_gun_van_data 
};
