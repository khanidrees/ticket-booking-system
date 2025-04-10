const { validationResult } = require('express-validator');
const userService = require('./userService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiResponse } = require('../../utils/ApiResponse');

const postUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(new ApiResponse(
      422,
      'Validation Errors',
      { errors: errors.array() },
    ));
  }
  const {
    userID, name, email, password,
  } = req.body;
  
  const response = await userService
    .postUser(userID, name, email, password);
  return res.json(response);
  
});

const loginUser = asyncHandler(async (req, res, next) => {
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
  const response = await userService.loginUser(email, password);
  return res
    .json(response);
});



module.exports = {
  postUser,
  loginUser,
};
