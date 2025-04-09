const express = require('express');

const router = express.Router();
const { body } = require('express-validator');

const User = require('./userModel');
const userController = require('./userController');
const { isAuthorized } = require('./auth');

router.post(
  '/register',
  [
    // TODO : add userID validation for duplication
    body('userID', 'Enter atleast 6 characters')
      .trim()
      .isLength({ min: 6, max: 15 })
      ,
    body('email')
      .isEmail()
      .withMessage('Please Enter Valid Email')
      .custom((value, { req }) => User.findOne({ email: value })
        .then((user) => {
          if (user) {
            return Promise.reject('Please enter another email');
          }
        }))
      .normalizeEmail(),
    body('password', 'Enter 8 char of alphanumeric type onnly')
      .trim()
      .isLength({ min: 6, max: 8 })
      .isAlphanumeric()
      ,
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password must be same!');
        }
        return true;
      })
      ,
  ],
  userController.postUser
  ,
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter Valid Email')
      .normalizeEmail(),
    body('password', 'Enter 8 char of alphanumeric type onnly')
      .isLength({ min: 6, max: 8 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.loginUser
  ,
);



module.exports = router;
