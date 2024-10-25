export const formatCurrency = (value: string | number) => {
    const numericValue = Number(value.toString().replace(/\D/g, '')) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  };