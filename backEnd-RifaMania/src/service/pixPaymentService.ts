import { Payment, MercadoPagoConfig } from "mercadopago";
import { PaymentRequestData } from "../@types/paymentTypes";
import { prisma } from "../lib/prisma";
import { decrypt } from "../utils/cryptoUtils";

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

  const decryptedAccessToken = decrypt(user.accessToken)
  console.log(decryptedAccessToken)

  const client = new MercadoPagoConfig({
    accessToken: decryptedAccessToken,
  });
  const payment = new Payment(client);

  const basePaymentData: PaymentRequestData = {
    transaction_amount: paymentData.transaction_amount,
    description: paymentData.description,
    payment_method_id: "pix",
    payer: {
      email: paymentData.payer.email,
    },
  };

  const result = await payment.create({
    body: basePaymentData,
    requestOptions: { idempotencyKey: `payment_pix_${Date.now()}` },
  });

  return result;
}
