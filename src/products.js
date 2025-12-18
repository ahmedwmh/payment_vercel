import { REDIRECT_URL } from "./wayl-config.js";

const products = [
    { id: '1', name: 'Product 1', price: 1000, image: "" },
    { id: '2', name: 'Product 2', price: 1000, image: "" },
    { id: '3', name: 'Product 3', price: 1000, image: "" }
];

// Make buyProduct available globally
window.buyProduct = buyProduct;

document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    checkPaymentSuccess();
});

function displayProducts() {
    const container = document.getElementById('products');
    if (!container) return;
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" />` : '<div class="placeholder-image">📦</div>'}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString()} IQD</p>
                <button class="buy-button" onclick="buyProduct('${product.id}')">
                    Buy Now
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function buyProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }

    // Validate minimum amount (1000 IQD as per API docs)
    if (product.price < 1000) {
        showMessage('Minimum payment amount is 1000 IQD', 'error');
        return;
    }

    // Generate unique reference ID
    const referenceId = `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare payment data according to Wayl API documentation
    const paymentData = {
        referenceId: referenceId,
        currency: "IQD",
        total: product.price,
        customParameter: product.id,
        lineItem: [{
            label: product.name,
            amount: product.price,
            type: 'increase'
        }],
        redirectionUrl: REDIRECT_URL,
    };

    try {
        // Show loading state
        showMessage('Creating payment link...', 'info');
        
        const apiUrl = '/api/create-link';

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP Error: ${response.status}`);
        }

        // Get payment URL from response (according to API docs: result.data.url)
        const paymentURL = result.data?.url;

        if (paymentURL) {
            // Redirect to Wayl payment page
            window.location.href = paymentURL;
        } else {
            throw new Error('Payment URL not received from API');
        }

    } catch (error) {
        console.error('Payment error:', error);
        showMessage(`Payment failed: ${error.message}`, 'error');
    }
}

function checkPaymentSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const referenceId = urlParams.get("referenceId");
    const success = urlParams.get("success");
    
    if (success === 'true' || referenceId) {
        showMessage('Payment Successful! Thank you for your purchase.', 'success');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existing = document.querySelector('.message');
    if (existing) {
        existing.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Add to page
    const app = document.getElementById('app');
    if (app) {
        app.insertBefore(messageEl, app.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}