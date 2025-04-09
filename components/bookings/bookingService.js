const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const Booking = require('./bookingModel');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiResponse } = require('../../utils/ApiResponse');
const { ApiError } = require('../../utils/ApiError');
const { default: mongoose } = require('mongoose');
const { Showtime } = require('../movies/movieModel');
const { generateBookingReference, PAYMENT_STATUSES } = require('../../utils/booking');
const { stripe } = require('../../payment');

const createBooking = async (userId, showtimeId, numberOfTickets) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    // 1. Find the showtime and lock it for update
    const showtime = await Showtime.findOneAndUpdate(
      { _id: showtimeId, available_seats: { $gte: numberOfTickets } },
      { $inc: { available_seats: -numberOfTickets } },
      { new: true, session, runValidators: true } // Important: Pass the session
  );

  if (!showtime) {
      // await session.abortTransaction();
      // session.endSession();
      throw new Error('Not enough seats available or showtime not found.');
  }

  // 2. Create the booking
  const booking = new Booking({
      _id: new mongoose.Types.ObjectId(),
      user_id: userId,
      showtime_id: showtimeId,
      number_of_tickets: numberOfTickets,
      total_amount: showtime.price * numberOfTickets * 100,
      booking_reference: generateBookingReference()
  });

  await booking.save({ session });  // Important: Pass the session

  // 3. Commit the transaction
  await session.commitTransaction();
  session.endSession();
  return { booking, showtime };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    throw new ApiError(500, 'Something went wrong while booking');
  }

  
  
};

const getAllBookings = async ( page, limit, userId)=>{
  const skip = (page - 1) * limit;
  const bookings = await Booking.find({
                  user_id : userId
                })
                  .skip(skip)
                  .limit(limit)
                  .populate({
                    path: 'showtime_id',
                    select: 'movie_id start_time -_id',
                    populate: {
                      path: 'movie_id',
                      select: 'title duration -_id'
                    }
                  });
  const totalBookings = await Booking.find({
    user_id : userId
  }).count();
  const resposne = new ApiResponse(
    200,
    {
      bookings,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: page
    },
    'Bookings Retrieved Successfully',
  );
  return resposne;
  
} 

const cancelBooking = async ( bookingId, userId )=>{
  const booking = await Booking.findById(bookingId).populate('showtime_id');

  if (!booking) {
    throw new ApiError(404, 'Something went wrong Booking not found booking');
  }
  // Authorization: Ensure the user owns the booking
  console.log(booking.user_id.toString(),"-", userId.toString())
  if (booking.user_id.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
  }

  //  Allow cancellation up to 24 hours before showtime
  const now = new Date();
  const showtimeStart = new Date(booking.showtime_id.start_time);
  const cancellationCutoff = new Date(showtimeStart.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

  if (now > cancellationCutoff) {
    throw new ApiError(400, 'Cancellation not allowed within 24 hours of showtime');
  }

  
  

  // Update seat availability and updtae the booking status 
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //  issue a refund based on booking.stripe_payment_id
    let refund;
    if (booking.stripe_payment_id) {
        try {
            refund = await stripe.refunds.create({
                payment_intent: booking.stripe_payment_id,
            });
            console.log(`Refund initiated for Payment Intent: ${booking.stripe_payment_id}, Status: ${refund.status}`);
        } catch (stripeErr) {
            console.error(`Stripe Refund Error: ${stripeErr.message}`);
            // Consider whether to proceed with cancellation even if refund fails
            // In some cases, you might want to log the error and continue
            // In other cases, you might want to abort the cancellation
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(500, 'Error processing refund. Cancellation aborted.');
        }
    }
      // Increase available seats
      await Showtime.findByIdAndUpdate(booking.showtime_id, { $inc: { available_seats: booking.number_of_tickets } }, { session });

      booking.payment_status = PAYMENT_STATUSES.canceled;
      booking.save({session});

      await session.commitTransaction();
      session.endSession();

      return new ApiResponse(200,{booking},'Booking cancelled and refund processed' )

  } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err);
      throw new ApiError(500, 'Error cancelling booking')
  }
}


const fulfillOrder = async (paymentIntent)=>{
  const updatedBooking = await Booking.findOneAndUpdate({
    stripe_payment_id: paymentIntent.id,
  },
  {
    $set : {
      payment_status: PAYMENT_STATUSES.completed
    }
  }
  )
};

const updateBookingPaymentStatus = async (paymentIntentId, status)=>{
  const updatedBooking = await Booking.findOneAndUpdate({
    stripe_payment_id: paymentIntent.Id,
  },
  {
    $set : {
      payment_status: status
    }
  }
  )
};

module.exports = {
  createBooking,
  getAllBookings,
  cancelBooking,
  fulfillOrder,
  updateBookingPaymentStatus
};
