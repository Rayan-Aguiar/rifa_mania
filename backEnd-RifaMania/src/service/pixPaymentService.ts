import { Payment, MercadoPagoConfig } from "mercadopago";
import { PaymentRequestData } from "../@types/paymentTypes";
import { prisma } from "../lib/prisma";

//accessToken:"APP_USR-834756092639222-103111-0a22d9beadccc9c80411069fd2bbc4de-168270801"
export async function processPixPayment(
  userId: string,
  paymentData: PaymentRequestData
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      accessToken: true,
    },
  });

  if (!user || !user.accessToken) {
    throw new Error("Access token não encontrado para este usuário.");
  }

  const client = new MercadoPagoConfig({
    accessToken: user.accessToken,
  });
  const payment = new Payment(client);

  const basePaymentData: PaymentRequestData = {
    transaction_amount: paymentData.transaction_amount,
    description: paymentData.description,
    payment_method_id: "pix",
    payer: {
      email: paymentData.payer.email,
    },
    /* notification_url: "https://seusite.com/webhook/mercadopago" */
  };

  const result = await payment.create({
    body: basePaymentData,
    requestOptions: { idempotencyKey: `payment_pix_${Date.now()}` },
  });

  return result;
}
