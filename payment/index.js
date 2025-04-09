const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount, currency) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in smallest currency unit (e.g., cents)
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            description: "payment for booking a show ticket",
        });
        return paymentIntent;
    } catch (error) {
        console.error('Error creating Payment Intent:', error);
        throw error;
    }
}

module.exports = {
    createPaymentIntent,
    stripe,
}