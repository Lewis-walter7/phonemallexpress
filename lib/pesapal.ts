const PESAPAL_ENV = process.env.PESAPAL_ENV || 'sandbox';
const BASE_URL = PESAPAL_ENV === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET!;

export interface PesaPalOrder {
    id: string; // Internal Order ID
    currency: string;
    amount: number;
    description: string;
    billing_address: {
        email_address: string;
        phone_number?: string;
        country_code?: string;
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        line_1?: string;
        line_2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        zip_code?: string;
    };
    callback_url: string;
    notification_id?: string; // Optional if we want to register IPN
}

export const pesapal = {
    /**
     * Authenticate with PesaPal to get a Bearer Token
     */
    async getAccessToken(): Promise<string> {
        const response = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                consumer_key: CONSUMER_KEY,
                consumer_secret: CONSUMER_SECRET,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('PesaPal Auth Error:', error);
            throw new Error(`PesaPal Auth Failed: ${error}`);
        }

        const data = await response.json();
        console.log('PesaPal Auth Response:', JSON.stringify(data, null, 2));

        if (!data.token) {
            throw new Error('PesaPal Auth: No token in response');
        }

        return data.token;
    },

    /**
     * Register an Instant Payment Notification (IPN) URL
     */
    async registerIPN(token: string, ipnUrl: string): Promise<string> {
        const response = await fetch(`${BASE_URL}/api/URLSetup/RegisterIPN`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                url: ipnUrl,
                ipn_notification_type: 'GET', // or POST
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`PesaPal IPN Registration Failed: ${error}`);
        }

        const data = await response.json();
        return data.ipn_id;
    },

    /**
     * Submit an Order Request to PesaPal
     */
    async submitOrder(token: string, orderData: PesaPalOrder) {
        const response = await fetch(`${BASE_URL}/api/Transactions/SubmitOrderRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: orderData.id,
                currency: orderData.currency,
                amount: orderData.amount,
                description: orderData.description,
                callback_url: orderData.callback_url,
                notification_id: orderData.notification_id,
                billing_address: orderData.billing_address,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`PesaPal Order Submission Failed: ${error}`);
        }

        const data = await response.json();
        // data contains: { order_tracking_id, merchant_reference, redirect_url, etc. }
        return data;
    },

    /**
     * Get Transaction Status
     */
    async getTransactionStatus(token: string, orderTrackingId: string) {
        const response = await fetch(`${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // warning: fail silent or throw?
            console.warn(`PesaPal Status Check Warning: ${response.statusText}`);
            return null;
        }

        return await response.json();
    }
};
