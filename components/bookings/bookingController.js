const { validationResult } = require('express-validator');
const bookingService = require('./bookingService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiResponse } = require('../../utils/ApiResponse');
const { createPaymentIntent } = require('../../payment');

// Admin 

const createBooking = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(new ApiResponse(
      422,
      'Validation Errors',
      { errors: errors.array() },
    ));
  }
  const {
    showtimeId,
    numberOfTickets
  } = req.body;
  const userId = req.user._id;
  const { booking, showtime } = await bookingService
    .createBooking(userId, showtimeId, numberOfTickets);

  // Create a Payment Intent with Stripe
  const paymentIntent = await createPaymentIntent(booking.total_amount, 'inr');

  // Update the booking with the Stripe Payment Intent ID
  booking.stripe_payment_id = paymentIntent.id;
  booking.payment_intent_created_at = new Date();
  await booking.save();

  res.status(201).json(new ApiResponse(201, {
      bookingReference: booking.booking_reference,
      paymentIntentClientSecret: paymentIntent.client_secret, // Send client secret to the client
  },
  'Booking successful!'
  ));
  
 
  
});

const getAllBookings = asyncHandler(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;
  const response = await bookingService.getAllBookings(parseInt(page), parseInt(limit), req.user._id);

  return res.json(response);
});


const cancelBooking = asyncHandler(async(req, res, next) => {
  const { bookingId } = req.params;
  const response = await bookingService.cancelBooking(bookingId, req.user._id);
  return res.json(response);
});



module.exports = {
  createBooking,
  getAllBookings,
  cancelBooking,
};
