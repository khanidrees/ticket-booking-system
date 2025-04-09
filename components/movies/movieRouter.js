const express = require('express');

const router = express.Router();
const { body } = require('express-validator');

const movieController = require('./movieController');

const { isAuthorized, isAdmin } = require('../auth/auth');
const { areShowtimesValid } = require('../../utils/movie');
const { Movie } = require('./movieModel');
// ADMIN ROUTES
router.post(
  '/admin/movies',
  isAuthorized,
  isAdmin,
  // TODO validate showtimes if they are possible or not
  [ 
    body('movieId')
      .isLength({min: 3})
      .custom((value) => Movie.findOne({ movieId: value })
        .then((movie) => {
          if (movie) {
            return Promise.reject('Please use a unique movieId');
          }
        }))
    ,
    body('title')
      .isLength({min: 5 }),
    body('description')
      .isLength({min: 8 }),
    body('duration')
      .isNumeric(),
    body('showtimes')
      .isArray({min: 1})
      .custom( arr => {
        // arr holds the full array
        return arr.every( (dateStr) => {
          if (!isNaN(new Date(dateStr))) {
             return true;
          } 
          return false;    
       })
      })
     .withMessage('Array must contains date strings')
     .custom((showtimes, { req })=>{
      const showtimeDates = showtimes.map(dateString => new Date(dateString));
      const duration = req.body.duration;
      // Validate showtime dates and 15-minute break
      if (!areShowtimesValid(showtimeDates, duration, 15)) {
          return false;
      }
      return true;
     })
     .withMessage('dates must be have (duration + 15min) difference')
     ,
     body('total_seats')
     .isNumeric(),
     body('price')
     .isNumeric()
  ],
  movieController.createMovie
  ,
);

// TODO : PUT DELETE

// router.put(
//   '/admin/movie',
//   isAuthorized,
//   isAdmin,
//   movieController.loginUser
//   ,
// );

// router.delete(
//   '/admin/movie/:movieId',
//   isAuthorized,
//   isAdmin,
//   movieController.deleteMovie
// )

// client routes

router.get('/movies/search',
  isAuthorized,
  movieController.getMoviesByQuery
)

router.get('/movies',
  isAuthorized,
  movieController.getAllMovies
)


module.exports = router;
