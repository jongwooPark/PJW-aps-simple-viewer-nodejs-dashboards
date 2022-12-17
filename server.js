const express = require('express');
const { PORT } = require('./config.js');
const forge_sample = require('./routes/forge_sample.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));
//app.use('/forge_sample',forge_sample );
app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
