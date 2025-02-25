export interface RaffleProps {
    id: string;
    name: string;
    prizeImage?: string;
    status: 'ONLINE' | 'CANCELLED' | 'EXPIRED' | 'SORTING' | 'CONCLUDED';
    drawDate: string;
    uniqueLink: string;
    soldTicketsCount?: number;
    totalNumbers?: number;
}