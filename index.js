const express = require('express');
const app = express();
app.use(express.json());

app.use('/auto', require('./api/autos'));
app.use('/arma', require('./api/armas')); 
app.use('/gta', require('./api/gta')); 


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
