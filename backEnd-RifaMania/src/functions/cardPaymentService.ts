import { Payment, MercadoPagoConfig } from "mercadopago";
import { PaymentRequestData } from "../@types/paymentTypes";


export async function processCardPayment(paymentData: PaymentRequestData) {
    const client = new MercadoPagoConfig({ accessToken: "APP_USR-834756092639222-103111-0a22d9beadccc9c80411069fd2bbc4de-168270801" });
    const payment = new Payment(client);

    const basePaymentData: PaymentRequestData = {
        transaction_amount: paymentData.transaction_amount,
        description: paymentData.description,
        payment_method_id: paymentData.payment_method_id,
        payer: {
            email: paymentData.payer.email,
            identification: {
                type: paymentData.payer.identification?.type,
                number: paymentData.payer.identification?.number
            }
        },
        installments: paymentData.installments,
        token: paymentData.token,
        /* notification_url: "https://seusite.com/webhook/mercadopago" */
    };

    const result = await payment.create({
        body: basePaymentData,
        requestOptions: { idempotencyKey: `payment_card_${Date.now()}` }
    });

    return result;
}