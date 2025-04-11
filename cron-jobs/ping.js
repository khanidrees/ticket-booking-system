const cron = require('node-cron');
const axios = require('axios');

const serverUrl = process.env.SERVER_URL;


cron.schedule('*/10 * * * *', async () => {
  console.log('Pinging the server to keep it alive...');

  try {
      const response = await axios.get(serverUrl + '/api/v1/health'); 
      console.log(`Ping successful. Status code: ${response.status}`);
  } catch (error) {
      console.error('Error pinging the server:', error.message);
  }
});