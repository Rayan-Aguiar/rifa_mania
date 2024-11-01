export const formatCardNumber = (value: string) => {

    const cleaned = value.replace(/\D/g, '');
  

    const limited = cleaned.slice(0, 16);
  

    const matches = limited.match(/.{1,4}/g); 
  

    if (!matches) return limited;
  

    return matches.join(' ');
  };