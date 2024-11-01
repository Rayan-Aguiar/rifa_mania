export interface PaymentRequestData {
    transaction_amount: number;
    description: string;
    payment_method_id: string;
    payer: {
        email: string;
        identification?: {
            type: string | undefined;
            number: string | undefined;
        };
    };
    installments?: number;
    token?: string;
    notification_url?: string;
}