function generateBookingReference() {
  return Math.random().toString(36).substring(2, 15).toUpperCase(); // Example
}

const PAYMENT_STATUSES = {
  pending: 'pending', 
  completed:'completed',
  failed: 'failed', 
  refunded:'refunded',
  canceled: 'canceled'
}

module.exports = {
  generateBookingReference,
  PAYMENT_STATUSES
}