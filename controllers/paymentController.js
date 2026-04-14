const axios = require('axios');

async function initializePayment({ email, amount, provider }) {
  try {
    // For MVP, we only support Paystack
    if (provider && provider !== 'paystack') {
      throw new Error('Unsupported payment provider');
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        email,
        amount, // already in kobo
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: "User Email",
              variable_name: "user_email",
              value: email
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data.data;

    return {
      // returns payment reference, and its link to our AuthController
      reference: data.reference,
      payment_link: data.authorization_url
    };

  } catch (error) {
    console.error('Paystack Init Error:', error.response?.data || error.message);
    throw new Error('Payment initialization failed');
  }
}

module.exports = {
  initializePayment
};