const seed_random_number_generator = require('../util/rng.js');
const misc = require('../util/misc.js');
const tunables = require('../util/tunables.js');
const zones = require('../data/zones.json');

const DISABLED_LOCATION = 4;

function get_gun_van_location() {
    let rng = new seed_random_number_generator(misc.get_seed_value());
    let iVar0 = rng.get_random_int_ranged(0n, 29n);

    while (iVar0 === DISABLED_LOCATION) {
        iVar0 = rng.get_random_int_ranged(0n, 29n);
    }
    return iVar0;
}

function get_gun_van_data() {
    const loc = get_gun_van_location();
    const zone_name = zones.gun_van[loc];
    const map_image = zones.gv_map[loc]; 

    let inventory_text = `**Armas:**\n`;
    let armor_added = false; // Control para no repetir la línea de blindaje

    // Bucle de Armas
    for (let i = 0; i <= 9; i++) {
        let weapon_name = tunables.get_tunable('XM22_GUN_VAN_SLOT_WEAPON_TYPE_' + i);
        let discount = tunables.get_tunable('XM22_GUN_VAN_SLOT_WEAPON_DISCOUNT_' + i);
        
        if (weapon_name !== null && weapon_name !== 'invalid') {
            // Si es blindaje (0)
            if (weapon_name === 0 || weapon_name === "0") {
                if (!armor_added) {
                    inventory_text += `- Todo el blindaje corporal (${Math.round(discount * 100)}%)\n`;
                    armor_added = true; // Ya lo pusimos, ignorar los siguientes ceros
                }
            } else {
                // Limpiar nombre de arma (Ej: WEAPON_SMG -> SMG)
                let clean_name = weapon_name.replace('WEAPON_', '').replace('_', ' ');
                inventory_text += `- ${clean_name} (${Math.round(discount * 100)}%)\n`;
            }
        }
    }

    // Bucle de Arrojables
    inventory_text += `\n**Arrojables:**\n`;
    for (let i = 0; i <= 2; i++) {
        let throwable_raw = tunables.get_tunable('XM22_GUN_VAN_SLOT_THROWABLE_TYPE_' + i);
        let discount = tunables.get_tunable('XM22_GUN_VAN_SLOT_THROWABLE_DISCOUNT_' + i);
        
        if (throwable_raw !== null && throwable_raw !== 'invalid') {
            let clean_throw = throwable_raw.replace('WEAPON_', '').replace('_', ' ');
            inventory_text += `- ${clean_throw} (${Math.round(discount * 100)}%)\n`;
        }
    }

    return {
        success: true,
        location: zone_name,
        image_url: map_image,
        message: inventory_text
    };
}

module.exports = {
    get_gun_van_data
};
