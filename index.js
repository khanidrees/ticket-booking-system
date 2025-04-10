// const https = require('https');
// const fs = require('fs');
require('dotenv').config();

const app = require('./app');
// var options = {
//   key: fs.readFileSync( '/etc/secret/rootCA.key'),
//   cert: fs.readFileSync( '/etc/secret/rootCA.pem')
// };

const PORT = process.env.PORT || 8000;

// https.createServer(options, app).listen(PORT,() => {
//     console.log('server started at ', PORT);
//   });

app.listen(PORT, () => {
  console.log('server started at ', PORT);
});