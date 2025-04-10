const express = require('express');

const router = express.Router();
const { body } = require('express-validator');

const User = require('./userModel');
const userController = require('./userController');
const { isAuthorized } = require('./auth');

router.post(
  '/register',
  [
    body('name', 'Enter 5  atleast chars')
      .trim()
      .isLength({ min: 5, max: 20 }),
    body('userID', 'Enter atleast 6 characters')
      .trim()
      .isLength({ min: 6, max: 15 })
      .custom(async (value)=>{
        const user =  await User.findOne({userID: value});
        if(user){
          return Promise.reject('Please enter another userID');
        } 
        return true
      })
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
