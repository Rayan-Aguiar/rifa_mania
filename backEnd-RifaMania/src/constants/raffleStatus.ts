export const RaffleStatus = {
    ONLINE: 'Online',
    CANCELLED: 'Cancelado',
    EXPIRED: 'Expirado',
    SORTING: 'Sortear'
  } as const;
  
  export type RaffleStatusType = typeof RaffleStatus[keyof typeof RaffleStatus];