const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDatabase() {
  try {
    await mongoose.connect(
      process.env.DB_CONNECT,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log('Successfully connected to database');
    require('../cron-jobs/cancelPaymentIntent');
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  connectToDatabase,
};
