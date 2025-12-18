import { REDIRECT_URL, WAYL_API_KEY } from "./wayl-config.js";

const products = [
    { id: '1', name: 'Product 1', price: 1000, image:"" },
    { id: '2', name: 'Product 2', price: 5000 , image:"" },
    { id: '3', name: 'Product 3', price: 10000 , image:"" }
];

document.addEventListener("DOMContentLoaded", ()=>{
    displayProducts();
})

function displayProducts() {
    const container = document.getElementById('products');
    container.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img  src="${product.image}"/>
            <h3>${product.name}</h3>
            <p>${product.price} IQD</p>
            <button onclick="buyProduct('${product.id}')">Buy Now</button>
        `;
        container.appendChild(card);
    });
}


async function buyProduct(productId) {

    const product = products.find(p => p.id === productId);

    if(!product) return ;

    const referenceId = `ref-${Date.now()-Math.floor(Math.random() * 10).toString(16)}`;


    const paymentData =  {
        referenceId:referenceId,
        currency:"IQD",
        total:product.price,
        customParameter: product.id,
        lineItem:[{
            label: product.name,
            amount: product.price,
            type: 'increase'
        }],
        redirectionUrl:REDIRECT_URL,
    };


    try {
        const apiUrl = '/api/create-link';

        const response = await fetch(apiUrl, {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'X-WAYL-AUTHENTICATION': WAYL_API_KEY, 
            },
            body : JSON.stringify(paymentData),
        });

        if(!response.ok){
            throw new Error("HTTP ERROR STATUS")
        }

        const result = await response.json();
        const paymentURL = result.data?.url || result.url;

        if(paymentURL){
            window.location.href = paymentURL;
        }


    }

    catch(error){

    }



    
}


function checkPaymentSuccess (){
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get("success") === 'true' || urlParams.get("referenceId")){
        alert("Payment Success");
    }
}