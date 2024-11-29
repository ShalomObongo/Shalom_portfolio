const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { amount, email, isRecurring, interval } = req.body;

        if (!amount || amount < 100) {
            return res.status(400).json({ 
                status: false,
                message: 'Invalid amount' 
            });
        }

        if (!email) {
            return res.status(400).json({ 
                status: false,
                message: 'Email is required' 
            });
        }

        console.log('Initializing payment with data:', { amount, email, isRecurring, interval });

        const basePayload = {
            amount,
            email,
            currency: 'KES',
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-payment`,
        };

        let endpoint = 'https://api.paystack.co/transaction/initialize';
        let payload = basePayload;

        if (isRecurring) {
            try {
                // For recurring payments, we first create a plan
                const planResponse = await axios.post(
                    'https://api.paystack.co/plan',
                    {
                        name: `${interval} Subscription`,
                        amount,
                        interval,
                        currency: 'KES',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!planResponse.data.status) {
                    throw new Error(planResponse.data.message || 'Failed to create payment plan');
                }

                // Then initialize a subscription transaction
                payload = {
                    ...basePayload,
                    plan: planResponse.data.data.plan_code,
                };
            } catch (planError) {
                console.error('Plan creation error:', planError);
                return res.status(500).json({
                    status: false,
                    message: planError.message || 'Failed to create payment plan'
                });
            }
        }

        const response = await axios.post(
            endpoint,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Paystack API Response:', JSON.stringify(response.data, null, 2));

        if (!response.data.status || !response.data.data?.authorization_url) {
            throw new Error(response.data.message || 'Failed to initialize payment');
        }

        return res.json({
            status: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Payment initialization error:', error.response?.data || error.message);
        return res.status(500).json({
            status: false,
            message: error.response?.data?.message || error.message || 'Failed to initialize payment'
        });
    }
};
