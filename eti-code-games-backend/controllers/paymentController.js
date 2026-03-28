const https = require('https');
const pool = require('../config/db');

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

async function initializePayment(req, res) {
  try {
    const { 
      full_name, 
      email, 
      phone, 
      university, 
      department = "Computer Science", 
      level = "300L", 
      category, 
      team_name = "" 
    } = req.body;

    if (!email || !full_name || !university || !category) {
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }

    const amount = 200000; // ₦2,000 in kobo

    const params = JSON.stringify({
      email,
      amount,
      callback_url: `${process.env.FRONTEND_URL}/success.html?reference=${Date.now()}`, 
      metadata: {
        full_name,
        phone,
        university,
        department,
        level,
        category,
        team_name
      }
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const reqPaystack = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => data += chunk);
      apiRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status) {
            res.status(200).json({
              status: true,
              authorization_url: response.data.authorization_url,
              reference: response.data.reference,
              message: "Payment initialized successfully"
            });
          } else {
            res.status(400).json({ status: false, message: response.message });
          }
        } catch (e) {
          res.status(500).json({ status: false, message: "Failed to parse Paystack response" });
        }
      });
    });

    reqPaystack.on('error', (error) => {
      console.error(error);
      res.status(500).json({ status: false, message: "Payment initialization failed" });
    });

    reqPaystack.write(params);
    reqPaystack.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
}

module.exports = { initializePayment };