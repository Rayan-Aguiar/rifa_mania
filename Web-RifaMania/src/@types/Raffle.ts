export interface RaffleProps {
    id: string;
    name: string;
    img?: string;
    status: 'ONLINE' | 'CANCELLED' | 'EXPIRED' | 'SORTING' | 'CONCLUDED';
    drawDate: string;
}