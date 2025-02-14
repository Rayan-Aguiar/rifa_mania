declare module "@mercadopago/sdk-js" {
    export function loadMercadoPago(): Promise<MercadoPagoInstance>;
  
    interface MercadoPagoFields {
      createCardToken(data: {
        cardNumber: string;
        cardExpirationMonth: string;
        cardExpirationYear: string;
        securityCode: string;
        cardholderName: string;
        identificationType: string;
        identificationNumber: string;
      }): Promise<{ id: string }>;
    }
  
    interface MercadoPagoInstance {
      fields: MercadoPagoFields;
    }
  }
  