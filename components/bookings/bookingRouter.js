const express = require('express');

const router = express.Router();
const { body, param } = require('express-validator');

const bookingController = require('./bookingController');

const { isAuthorized, isAdmin } = require('../auth/auth');
const { areShowtimesValid } = require('../../utils/movie');
const { Movie } = require('./bookingModel');
const { Showtime } = require('../movies/movieModel');
const { default: mongoose } = require('mongoose');

router.post(
  '/bookings',
  isAuthorized,
  [ 
    body('showtimeId')
      .custom(async (value)=>{
        const show = await Showtime.findOne({
          _id: new mongoose.Types.ObjectId(value),
          start_time: {
            $gt : new Date(),
          }
        });
        if (!show) {
          return Promise.reject('Show Cant be booked, already started.');
        }
        return true;
      })
      
      .withMessage('Invalid Show'),
    body('numberOfTickets')
      .isInt({ min: 1 })
      .withMessage('numberOfTickets should be a valid number')
  ],
  bookingController.createBooking
  ,
);


router.get('/bookings',
  isAuthorized,
  bookingController.getAllBookings
)

router.delete('/bookings/:bookingId',
  isAuthorized,
  [ 
    param('bookingId')
      .isMongoId()
      .withMessage('Invalid BokingId'),
    
  ],
  bookingController.cancelBooking
)


module.exports = router;
