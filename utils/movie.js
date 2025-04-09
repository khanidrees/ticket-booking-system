function areShowtimesValid(showtimes, movieDuration, breakTime=15) {
  if (showtimes.length < 2) {
      return true; 
  }

  // Sort showtimes by start time
  showtimes.sort((a, b) => a.getTime() - b.getTime());

  for (let i = 0; i < showtimes.length - 1; i++) {
      const currentShowtime = showtimes[i];
      const nextShowtime = showtimes[i + 1];

      // Calculate the end time of the current showtime
      const currentShowtimeEnd = new Date(currentShowtime.getTime() + movieDuration * 60 * 1000);

      // Calculate the minimum break time (15 minutes)
      const minBreakTime = breakTime * 60 * 1000;
      console.log(nextShowtime.getTime(), " : ",currentShowtimeEnd.getTime() + minBreakTime )
      console.log(nextShowtime.getTime() < currentShowtimeEnd.getTime() + minBreakTime);
      // Check if the next showtime starts before the end of the current showtime + break
      if (nextShowtime.getTime() < currentShowtimeEnd.getTime() + minBreakTime) {
          return false; // Invalid showtime
      }
  }

  return true; 
}

module.exports = {
  areShowtimesValid,
}