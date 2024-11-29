const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { reference, trxref } = req.query;
        const paymentReference = reference || trxref;

        if (!paymentReference) {
            console.error('No payment reference provided');
            return res.redirect(`/buy-me-coffee.html?status=failed&message=${encodeURIComponent('No payment reference provided')}`);
        }

        console.log('Verifying payment:', paymentReference);

        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${paymentReference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Paystack verification response:', JSON.stringify(response.data, null, 2));

        const { status, data } = response.data;

        if (status && data.status === 'success') {
            // Payment was successful
            const paymentData = {
                amount: data.amount / 100, // Convert back to original currency
                currency: data.currency,
                reference: data.reference,
                email: data.customer.email,
                paymentDate: new Date(data.paid_at).toISOString(),
            };

            console.log('Payment successful:', paymentData);

            // Redirect to success page with payment details
            const successUrl = `/buy-me-coffee.html?status=success&amount=${paymentData.amount}&currency=${paymentData.currency}&reference=${paymentData.reference}`;
            return res.redirect(successUrl);
        } else {
            // Payment failed or is pending
            console.error('Payment verification failed:', data.gateway_response || 'Unknown error');
            return res.redirect(`/buy-me-coffee.html?status=failed&message=${encodeURIComponent(data.gateway_response || 'Payment verification failed')}`);
        }
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Failed to verify payment';
        return res.redirect(`/buy-me-coffee.html?status=failed&message=${encodeURIComponent(errorMessage)}`);
    }
};
