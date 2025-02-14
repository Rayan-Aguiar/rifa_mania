import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { useEffect, useState } from "react";

const cardSchema = z.object({
  cardNumber: z.string().optional(),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Data de validade inválida").optional(),
  cardCvc: z.string().optional(),
});

type CreditCardFormData = z.infer<typeof cardSchema>;

interface CreditCardFormProps {
  onTokenGenerated: (token: string | null) => void;
  onCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCardExpiryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCardToken: React.Dispatch<React.SetStateAction<string | null>>;
  cardholderName: string;
  identificationType: string;
  identificationNumber: string;
  handleCreateToken: (tokenCreator: () => Promise<void>) => Promise<void>;
}

interface CreateCardTokenResponse {
  id: string;
}

const publicKey = "TEST-488577a3-6003-4f8d-b5da-1fe7839a2842";

export function CreditCardForm({
  onTokenGenerated,
  onCardNumberChange,
  onCardExpiryChange,
  setCardToken,
  handleCreateToken,
  cardholderName,
  identificationType,
  identificationNumber,
}: CreditCardFormProps) {
  const { register, watch } = useFormContext<CreditCardFormData>();
  const [mp, setMp] = useState<any | null>(null);

  useEffect(() => {
    loadMercadoPago().then((MercadoPago) => {
      const mpInstance = new (MercadoPago as any)(publicKey);
      setMp(mpInstance);
    });
  }, []);

  const cardNumber = watch("cardNumber")?.replace(/\s+/g, "");
  const cardExpiry = watch("cardExpiry");
  const cardCvc = watch("cardCvc");

  const createToken = async () => {
    if (mp && cardNumber && cardExpiry && cardCvc) {
      console.log("Dados do cartão:", {
        cardNumber,
        cardExpirationMonth: cardExpiry.split("/")[0],
        cardExpirationYear: `20${cardExpiry.split("/")[1]}`,
        securityCode: cardCvc,
        cardholderName,
        identificationType,
        identificationNumber,
      });
  
      try {
        const response: CreateCardTokenResponse = await mp.createCardToken({
          cardNumber,
          cardExpirationMonth: cardExpiry.split("/")[0],
          cardExpirationYear: `20${cardExpiry.split("/")[1]}`,
          securityCode: cardCvc,
          cardholderName,
          identificationType,
          identificationNumber,
        });
        console.log("Token do cartão gerado:", response.id);
        onTokenGenerated(response.id);
        setCardToken(response.id);
      } catch (error) {
        console.error("Erro ao gerar o token do cartão:", error);
        onTokenGenerated(null);
        setCardToken(null);
      }
    } else {
      console.warn("Dados do cartão não estão completos:", { mp, cardNumber, cardExpiry, cardCvc });
    }
  };
  

  useEffect(() => {
    handleCreateToken(createToken);
  }, [handleCreateToken]);

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <Label htmlFor="cardNumber">Número do Cartão</Label>
        <Input
          id="cardNumber"
          type="text"
          maxLength={19}
          placeholder="0000 0000 0000 0000"
          {...register("cardNumber")}
          onChange={(e) => {
            register("cardNumber").onChange(e);
            onCardNumberChange(e);
          }}
        />
      </div>
      <div className="flex w-full gap-2">
        <div className="w-1/2">
          <Label htmlFor="cardExpiry">Validade</Label>
          <Input
            id="cardExpiry"
            type="text"
            maxLength={5}
            placeholder="MM/AA"
            {...register("cardExpiry")}
            onChange={(e) => {
              register("cardExpiry").onChange(e);
              onCardExpiryChange(e);
            }}
          />
        </div>
        <div className="w-1/2">
          <Label htmlFor="cardCvc">CVC</Label>
          <Input
            id="cardCvc"
            type="text"
            maxLength={4}
            placeholder="CVC"
            {...register("cardCvc")}
          />
        </div>
      </div>
    </div>
  );
}
