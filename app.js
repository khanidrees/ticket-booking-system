const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const https = require('https');

const { connectToDatabase } = require('./db/connect');

const userRouter = require('./components/auth/userRouter');
const movieRouter = require('./components/movies/movieRouter');
const bookingRouter = require('./components/bookings/bookingRouter');

const { ApiError } = require('./utils/ApiError');
const User = require('./components/auth/userModel');
const { default: mongoose } = require('mongoose');
const { fulfillOrder, updateBookingPaymentStatus, updateBookingPaymentCancelled } = require('./components/bookings/bookingService');
const { PAYMENT_STATUSES } = require('./utils/booking');

const app = express();

connectToDatabase();



// for security
app.use(helmet());

const whitelist = [process.env.FRONTEND_URL];
// console.log(whitelist);

// TODO : enable CORS in production 
const corsOptions = {
  // origin: function (origin, callback) {
  //   console.log(whitelist[0]==origin);
  //   console.log(whitelist[0]);
  //   console.log(origin);
  //   if (whitelist.includes(origin)) {
  //     callback(null, true)
  //   } else {
  //     console.log('origin:', origin, 'not allowed')
  //     callback(new Error('Not allowed by CORS'))
  //   }
  // }
};

app.use(cors(corsOptions));

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  console.log('webhook called');
  try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log(event.type, " Recieved");
  } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log(event);
  try{
    switch (event.type) {
      case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Fulfill the purchase, update booking status in MongoDB
          await fulfillOrder(paymentIntent);
          break;
      case 'payment_intent.payment_failed':
          const paymentIntentFailed = event.data.object;
          console.log(`Payment failed: ${paymentIntentFailed.last_payment_error?.message}`);
          // Update booking status to "failed" in MongoDB
          await updateBookingPaymentStatus(paymentIntentFailed.id, PAYMENT_STATUSES.failed);
          break;
      case 'charge.refunded':
          const chargeRefunded = event.data.object;
          //Update booking status to "refunded" in MongoDB
          await updateBookingPaymentStatus(chargeRefunded.payment_intent, PAYMENT_STATUSES.refunded);
          break;
      default:
          console.log(`Unhandled event type ${event.type}`);
    }
  }catch(err){
    return res.status(400).send(`Webhook Error while updating status: ${err.message}`);
  }
  

  res.status(200).end();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());



app.use('/api/v1', bookingRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1', movieRouter);



app.use((err, req, res, next) => {
  let error = err;
  console.log(err);
  if (!(err instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    // set a message from native Error instance or a custom one
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }
  console.log('err', JSON.stringify(error));
  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    // ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };
  // Send error response
  return res.status(error.statusCode).json(response);
});



module.exports = app;
