const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/ApiError');
const User = require('./userModel');

module.exports.isAuthorized = async (req, res, next) => {
  // console.log(req.headers);
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new ApiError(401, 'Unauthorized request');
    }
    // console.log(authorization);
    const decodedToken = jwt.verify(authorization, process.env.JWT_PRIVATE_KEY);

    // console.log(decodedToken);
    const user = await User.findById(decodedToken?.id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    req.user = user;
    next();
  } catch (error) {
    next(createError(401, error?.message || 'Unauthorized Request'));
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    // console.log(req.user);

    if (!req?.user?.roles?.includes('admin')) {
      throw new ApiError(401, 'Not a admin user');
    }

    next();
  } catch (error) {
    next(createError(401, error?.message || 'Unauthorized Request'));
  }
};
