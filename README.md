# Wayl Payment Integration

A modern payment integration using Wayl Payment Gateway, built with HTML, CSS, and JavaScript.

## Features

- ✅ Secure payment processing via Wayl API
- ✅ Beautiful, responsive UI
- ✅ Serverless API proxy (Vercel)
- ✅ Payment success handling
- ✅ Error handling and user feedback

## Setup Instructions

### 1. Environment Variables

Set up your Wayl API key in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `WAYL_API_KEY`
   - **Value**: Your Wayl API key (get it from [thewayl.com](https://thewayl.com))

### 2. Deploy to Vercel

The project is already configured for Vercel deployment. Simply:

```bash
# Install dependencies
npm install

# Deploy (if using Vercel CLI)
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
├── api/
│   └── create-link.js      # Vercel serverless function (proxies Wayl API)
├── src/
│   ├── main.js             # Main entry point
│   ├── products.js          # Product display and payment logic
│   ├── wayl-config.js       # Configuration
│   └── style.css            # Styles
├── index.html               # Main HTML file
└── package.json             # Dependencies
```

## API Integration

This project integrates with the [Wayl API](https://api.thewayl.com/reference) to create payment links.

### Payment Flow

1. User clicks "Buy Now" on a product
2. Frontend calls `/api/create-link` (Vercel serverless function)
3. Serverless function proxies request to Wayl API with authentication
4. Wayl returns payment URL
5. User is redirected to Wayl payment page
6. After payment, user is redirected back with `referenceId` parameter
7. Success message is displayed

### API Endpoint Used

- **POST** `/api/v1/links` - Create payment link
  - Base URL: `https://api.thewayl.com`
  - Authentication: `X-WAYL-AUTHENTICATION` header

## Customization

### Adding Products

Edit `src/products.js`:

```javascript
const products = [
    { id: '1', name: 'Product 1', price: 1000, image: "https://..." },
    // Add more products...
];
```

### Styling

Modify `src/style.css` to customize the appearance.

## Security Notes

- ✅ API key is stored securely in Vercel environment variables
- ✅ API key is NOT exposed in frontend code
- ✅ All API calls go through serverless function (no CORS issues)

## Live Demo

Visit: [https://payment-vercel.vercel.app/](https://payment-vercel.vercel.app/)

## Documentation

- [Wayl API Documentation](https://api.thewayl.com/reference)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## License

MIT

