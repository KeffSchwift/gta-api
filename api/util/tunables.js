const axios = require('axios');
const fs = require('fs');
const paths = require('../paths.js');

tunables_data = read_tunables_file();
labels_data = JSON.parse(fs.readFileSync(paths.LABELS_PATH, 'utf8'));

function read_tunables_file() {
    if (fs.existsSync(paths.TUNABLES_PATH)) {
        const tunables_raw_data = fs.readFileSync(paths.TUNABLES_PATH, 'utf8');
        return JSON.parse(tunables_raw_data);
    } else {
        return null;
    }
}

async function download_tunables() {
    return new Promise((resolve, reject) => {
        axios.get('https://api.rdo.gg/tunables/gta/pcros/')
            .then(response => {
                const json_data = response.data;

                fs.writeFileSync(paths.TUNABLES_PATH, JSON.stringify(json_data, null, 2));

                tunables_data = read_tunables_file();

                resolve(paths.TUNABLES_PATH);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function get_tunable(tunable) {
    let tunable_value = tunables_data.contents.tunables.BASE_GLOBALS[tunable];

    if (tunable_value !== undefined) {
        if (typeof tunable_value === 'string' && labels_data[tunable_value] !== undefined) {
            return labels_data[tunable_value];
        } else {
            return tunable_value;
        }
    } else {
        return 'invalid';
    }
}

module.exports = {
    download_tunables,
    get_tunable
}
