export const formatCardExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4); 
    if (cleaned.length === 0) return '';
  
    const month = cleaned.slice(0, 2);
    const year = cleaned.slice(2, 4);
  

    if (month && parseInt(month) > 12) {
      return 'Mês inválido, por favor verifique';
    }
  
    return year ? `${month}/${year}` : month; 
  };
  