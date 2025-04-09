const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userID: {
      type: String,
      require: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      select: false, // No select
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false, // No select
    },
    roles: {
      type:[ String ],
      default: ['client']
    }

  },
  {
    timestamps: true,
  },
);
const User = mongoose.model('User', userSchema);

module.exports = User;
