const mongoose = require('mongoose');

const { Schema } = mongoose;

const movieSchema = new Schema(
  {
    movieId: {
      type: String,
      required: true,
      unique: true,
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    duration: { 
      type: Number, 
      required: true 
    }, // Duration in minutes
    showtimes: [{ 
      type: mongoose.Schema.Types.ObjectId, ref: 'Showtime' 
    }], // Array of showtime IDs
    poster_url: { 
      type: String 
    } // URL to the movie poster image

  },
  {
    timestamps: true,
  },
);

const Movie = mongoose.model('Movie', movieSchema);
movieSchema.index({ title: 'text' }, { description: 'text' },);

const showtimeSchema = new mongoose.Schema({
  movie_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true 
  },
  start_time: { 
    type: Date,
    required: true
  },
  available_seats: { 
    type: Number, 
    required: true 
  },
  total_seats: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  }
});
const Showtime = mongoose.model('Showtime', showtimeSchema);
module.exports = {
  Movie,
  Showtime
}
