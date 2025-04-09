const { validationResult } = require('express-validator');
const userService = require('./movieService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiResponse } = require('../../utils/ApiResponse');

// Admin 

const createMovie = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(new ApiResponse(
      422,
      'Validation Errors',
      { errors: errors.array() },
    ));
  }
  const {
    movieId, title, description, showtimes, duration, total_seats, price
  } = req.body;
  
  const response = await userService
    .createMovie(movieId, title, description, showtimes, duration, total_seats, price);
  
  return res.json(response);
  
});

const updateMovie = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(new ApiResponse(
      422,
      'Validation Errors',
      { errors: errors.array() },
    ));
  }
  const {
    email, password,
  } = req.body;
  const response = await userService.updateMovie(email, password);

  return res.json(response);
});

const deleteMovie = asyncHandler(async(req, res, next) => {

});

// client
const getAllMovies = asyncHandler(async(req, res, next) => {
  const { limit = 10, page = 1 } = req.query;
  const response = await userService.getAllMovies(parseInt(page), parseInt(limit));
  return res.json(response);
});

const getMoviesByQuery = asyncHandler(async(req, res, next) => {
  const { query } = req.query;
  const response = await userService.getMoviesByQuery(query);
  return res.json(response);
});

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  getAllMovies,
  getMoviesByQuery
};
