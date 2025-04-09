const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    showtime_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Showtime', 
      required: true 
    },
    number_of_tickets: { 
      type: Number, 
      required: true 
    },
    booking_time: { 
      type: Date, 
      default: Date.now 
    },
    total_amount: { 
      type: Number, 
      required: true 
    },
    payment_status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded', 'canceled'], 
      default: 'pending' 
    },
    booking_reference: { 
      type: String,  
      required: true, 
      unique: true 
    },
    stripe_payment_id: { 
      type: String 
    } ,
    payment_intent_created_at: { 
      type: Date
    }

  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
