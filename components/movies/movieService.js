const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const User = require('./movieModel');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiResponse } = require('../../utils/ApiResponse');
const { ApiError } = require('../../utils/ApiError');
const { Movie, Showtime } = require('./movieModel');
const { default: mongoose } = require('mongoose');

const createMovie = async (movieId, title, description, showtimes, duration, total_seats, price) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const movie = new Movie({
      movieId,
      title,
      description,
      duration,
      showtimes:[]
    })
  
    const savedMovie = await movie.save({ session });
  
    // Create showtimes and associate them with the movie
    const createdShowtimes = [];
    for (const showtimeDate of showtimes) {
        const showtime = new Showtime({
            movie_id: savedMovie._id,
            start_time: showtimeDate,
            available_seats: total_seats,
            total_seats: total_seats,
            price: price
        });
        const savedShowtime = await showtime.save({ session });
        createdShowtimes.push(savedShowtime._id);
    }
  
    // Update the movie with the showtime references
    savedMovie.showtimes = createdShowtimes;
    await savedMovie.save({ session });
  
    await session.commitTransaction();
    session.endSession();
  
    // Populate the showtimes before sending the response
    const populatedMovie = await Movie.findById(savedMovie._id).populate('showtimes');
    
  
    if (!populatedMovie) throw new ApiError(500, 'Something went wrong while adding movie');
  
    return new ApiResponse(
      201,
      { populatedMovie },
      'Movie added Successfully',
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    throw new ApiError(500, 'Something went wrong while adding movie');
  }

  
  
};

const updateMovie = async (email, password) => {
};

const deleteMovie = async(movieId)=>{
}

const getAllMovies = async ( page, limit)=>{
  const skip = (page - 1) * limit;
  const movies = await Movie.find()
                  .skip(skip)
                  .limit(limit)
                  .populate({
                    path: 'showtimes',
                    match: {
                      start_time : {
                        $gte : new Date()
                      }
                    }
                  });
  const totalMovies = await Movie.countDocuments();
  const resposne = new ApiResponse(
    200,
    {
      movies,
      totalPages: Math.ceil(totalMovies / limit),
      currentPage: page
    },
    'Movies Retrieved Successfully',
  );
  return resposne;
  
} 

const getMoviesByQuery = async ( query )=>{
  const movies = await Movie.find({ $text: { $search: query } })
  
  const resposne = new ApiResponse(
    200,
    {
      movies
    },
    'Movies Retrieved Successfully',
  );
  return resposne;
};


module.exports = {
  createMovie,
  // updateMovie,
  // deleteMovie,
  getAllMovies,
  getMoviesByQuery,
};
