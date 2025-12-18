// Vercel Serverless Function to proxy Wayl API calls
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable (set in Vercel dashboard)
    // Fallback to default key if env var not set (for testing)
    const WAYL_API_KEY = process.env.WAYL_API_KEY || "WWI2LZxl51giAqxffsl4Dw==:8wTmnJpGrBt8vrpeAmqerVpmWplcYXp58fIanNs1Iv7c7dPBgyR/Pz5pp4Oh99F9RrwDHRQmzEjCVYAoNVuWE0oDrmPXGXbhsJM0C97ooJiHWiyhhS01146entAjMOqHchxkBJxjfOuFJCLwlEwd1VycObwtDrw9nNWJ38nHero=";
    
    if (!WAYL_API_KEY) {
      return res.status(500).json({ 
        message: 'WAYL_API_KEY environment variable is not set. Please configure it in your Vercel project settings.' 
      });
    }
    
    const WAYL_API_URL = 'https://api.thewayl.com/api/v1/links';

    // Get payment data from request body
    const paymentData = req.body;

    // Validate required fields
    if (!paymentData.referenceId || !paymentData.total || !paymentData.currency) {
      return res.status(400).json({ 
        message: 'Missing required fields: referenceId, total, and currency are required' 
      });
    }

    // Validate minimum amount (1000 IQD)
    if (paymentData.total < 1000) {
      return res.status(400).json({ 
        message: 'Minimum payment amount is 1000 IQD' 
      });
    }

    // Make request to Wayl API
    const response = await fetch(WAYL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WAYL-AUTHENTICATION': WAYL_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log the error for debugging
      console.error('Wayl API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        apiKeyLength: WAYL_API_KEY ? WAYL_API_KEY.length : 0
      });
      
      // Return more detailed error message
      return res.status(response.status).json({
        message: data.message || 'Payment failed',
        error: data,
        details: `Wayl API returned ${response.status}: ${data.message || response.statusText}`
      });
    }

    // Return the response from Wayl API
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

