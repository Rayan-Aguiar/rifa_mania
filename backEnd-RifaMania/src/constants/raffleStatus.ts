export const RaffleStatus = {
    ONLINE: 'Online',
    CANCELLED: 'Cancelado',
    EXPIRED: 'Expirado',
    SORTING: 'Sortear',
    CONCLUDED: 'Concluido',
  } as const;
  
  export type RaffleStatusType = typeof RaffleStatus[keyof typeof RaffleStatus];