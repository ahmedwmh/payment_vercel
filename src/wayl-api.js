const crypto = require('crypto');


function verifyWebhookSignature(data ,signature, secret){

    if(!signature) return false;
    const payload = JSON.stringify(payload)


    const exprectedSignature = crypto
    .createHash("sha256",secret)
    .update(payload)
    .digest("hex");

    return signature === exprectedSignature;

}

module.exports = {
    verifyWebhookSignature,
}

