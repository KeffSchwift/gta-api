const express = require('express');
const app = express();
app.use(express.json());

app.use('/bj', require('./api/bj'));
app.use('/race', require('./api/c4'));
app.use('/auto', require('./api/carros'));
app.use('/armas', require('./api/armas')); 
app.use('/time', require('./api/time'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
