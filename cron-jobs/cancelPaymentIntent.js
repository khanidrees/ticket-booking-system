const cron = require('node-cron');
const mongoose = require('mongoose');
const Booking = require('../components/bookings/bookingModel'); 
const { Showtime } = require('../components/movies/movieModel');
const { PAYMENT_STATUSES } = require('../utils/booking');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Schedule the task to run every minute 
cron.schedule('* * * * *', async () => {
    console.log('Running Payment Intent cancellation task...');

    try {
        // Find pending bookings older than 10 minutes
        const tenMinutesAgo = new Date(Date.now() -  10 * 60 * 1000);
        const pendingBookings = await Booking.find({
            payment_status: 'pending',
            payment_intent_created_at: { $lte: tenMinutesAgo }
        }).populate('showtime_id');

        for (const booking of pendingBookings) {
            try {
                // Cancel the Payment Intent
                if (booking.stripe_payment_id) {
                    await stripe.paymentIntents.cancel(booking.stripe_payment_id);
                    console.log(`Cancelled Payment Intent: ${booking.stripe_payment_id}`);
                }

                // Update booking status and increase seat availability (within a transaction)
                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    await Showtime.findByIdAndUpdate(booking.showtime_id, { $inc: { available_seats: booking.number_of_tickets } }, { session });
                    booking.payment_status = PAYMENT_STATUSES.canceled;
                    await booking.save({ session });

                    await session.commitTransaction();
                    session.endSession();

                    console.log(`Booking ${booking.booking_reference} cancelled successfully.`);

                } catch (err) {
                    await session.abortTransaction();
                    session.endSession();
                    console.error(`Error cancelling booking ${booking.booking_reference}:`, err);
                }
            } catch (stripeError) {
                console.error(`Error cancelling Payment Intent ${booking.stripe_payment_id}:`, stripeError);
            }
        }

        console.log('Payment Intent cancellation task completed.');

    } catch (error) {
        console.error('Error running Payment Intent cancellation task:', error);
    }
});