// Alexander
const express = require('express');
const router = express.Router();

// middleware - Sebastian
const { rateLimitCheck }  = require('../middleware/RatelimiterMiddle');

//helper functions - Barnard
const helper = require('../functions/helperFunctions')



// GET /api/taps - View all taps
router.get('/taps', rateLimitCheck, async (req, res) => {
  try {
    const taps = await helper.getAllTaps({activeOnly: true})
    res.status(200).json({
      success: true,
      count: taps.length,
      data: taps,
      message: "available taps retrieved successfully"
    });
  } catch (e) {
    console.error("Error fetching all taps:", e);
    res.status(500).json({
      success: false,
      error: "server error",
      message: e.message
    });
  }
  // try {
  //   const products = await RedisClient.getAllProducts();
  //   res.status(200).json({
  //     success: true,
  //     count: Array.isArray(products) ? products.length : 0,
  //     data: products,
  //     message: 'All taps retrieved successfully.'
  //   });
  // } catch (err) {
  //   console.error('Error fetching all taps:', err);
  //   res.status(500).json({
  //     success: false,
  //     error: 'Server error'
  //   });
  // }
});


// POST /api/public/taps/query - Search taps by specifications
router.post('/taps/query', rateLimitCheck, async (req, res) => {
  try {
    const { containerType, material, size, flow, liquidType } = req.body;

    // Basic input validation
    if (!containerType && !material && !size && !flow && !liquidType) {
      return res.status(400).json({
        success: false,
        error: 'At least one search field must be provided.'
      });
    }

    // Map frontend fields to backend model
    // const filters = {
    //   category: liquidType || null,
    //   material: material || null,
    //   flow_rate: flow || null,
    //   size: size || null,
    //   container_type: containerType || null
    // };
    const filters = {};

    if (liquidType) filters.liquid_type  = liquidType;
    if (material) filters.material = material;
    if (flow) filters.flow_rate = flow;
    if (size) filters.size = size;
    if (containerType) filters.container_type = containerType;

    const results = await helper.queryTaps(filters);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching taps found for your specifications.'
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      message: 'Matching taps retrieved successfully.'
    });

  } catch (err) {
    console.error('Error in /api/taps/query:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to process query request.',
      message: err.message
    });
  }
});

// GET /api/taps/:id - Get single tap by ID
router.get('/taps/:id', rateLimitCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const tap = await helper.getTapById(id);

    if (!tap) {
      return res.status(404).json({
        success: false,
        error: "Tap not found"
      });
    }

    res.status(200).json({
      success: true,
      data: tap,
      message: "Tap retrieved successfully"
    });
  } catch (e) {
    console.error("Error fetching tap:", e);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tap",
      message: e.message
    });
  }
});



//future plans
// POST /api/invoice - Send customer inquiry (rate-limited by same middleware)
// router.post('/invoice', rateLimitCheck, async (req, res) => {
//   try {
//     const { tapId, customerName, customerEmail, customerPhone, quantity, message } = req.body;

//     if (!tapId || !customerName || !customerEmail || !quantity) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing required fields.'
//       });
//     }

//     // Nodemailer config (uses .env)
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//       }
//     });

//     const mailOptions = {
//       from: process.env.SMTP_USER,
//       to: process.env.MANUFACTURER_EMAIL,
//       subject: `New Tap Inquiry - ${tapId}`,
//       html: `
//         <h3>Customer Inquiry</h3>
//         <p><strong>Name:</strong> ${customerName}</p>
//         <p><strong>Email:</strong> ${customerEmail}</p>
//         <p><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
//         <p><strong>Quantity:</strong> ${quantity}</p>
//         <p><strong>Message:</strong> ${message || 'No additional message'}</p>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       success: true,
//       message: 'Inquiry sent to manufacturer successfully.'
//     });

//   } catch (err) {
//     console.error('Error sending inquiry:', err);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to send inquiry.'
//     });
//   }
// });

module.exports = router;