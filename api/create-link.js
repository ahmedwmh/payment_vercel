// Vercel Serverless Function to proxy Wayl API calls
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Log for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using API Key:', WAYL_API_KEY.substring(0, 20) + '...');
      console.log('API Key Length:', WAYL_API_KEY.length);
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

    // Get response text first (we can parse it as JSON or use as text)
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // If response is not JSON, use text
      console.error('Wayl API non-JSON response:', responseText);
      return res.status(response.status).json({
        message: 'Invalid authentication key',
        error: 'Wayl API returned non-JSON response',
        details: `Status ${response.status}: ${responseText}`,
        hint: 'Please verify your WAYL_API_KEY in Vercel environment variables'
      });
    }

    if (!response.ok) {
      // Log the error for debugging
      console.error('Wayl API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        apiKeyLength: WAYL_API_KEY ? WAYL_API_KEY.length : 0,
        apiKeyPrefix: WAYL_API_KEY ? WAYL_API_KEY.substring(0, 20) : 'none'
      });
      
      // Handle 401 specifically
      if (response.status === 401) {
        return res.status(401).json({
          message: 'Invalid authentication key',
          error: data,
          details: 'The Wayl API rejected your authentication key. Please verify:',
          hints: [
            '1. Check your WAYL_API_KEY in Vercel environment variables',
            '2. Make sure the API key is complete and copied correctly',
            '3. Verify the key is active in your Wayl merchant dashboard',
            '4. Redeploy your Vercel project after setting the environment variable'
          ]
        });
      }
      
      // Return more detailed error message for other errors
      return res.status(response.status).json({
        message: data.message || data.msg || 'Payment failed',
        error: data,
        details: `Wayl API returned ${response.status}: ${data.message || data.msg || response.statusText}`
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

