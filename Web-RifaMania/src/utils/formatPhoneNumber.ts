export const formatPhoneNumber = (phone: string | null | undefined): string => {
    console.log(phone)
    if (!phone) {
        return ''; 
    }

    const cleaned = phone.replace(/[\s()-]+/g, '');

    if (cleaned.length === 11) {
        return `55${cleaned}`;
    }

    return ''; 
};
