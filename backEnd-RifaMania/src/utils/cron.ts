import cron from 'node-cron';
import { updateRaffleStatuses } from '../service/updateRaffleStatuses';

export const startCronJob = () => {
    try {
        cron.schedule('*/30 * * * * *"', async() =>{
            console.log('Executando a atualização de status...')
            await updateRaffleStatuses()
        })
    } catch(error){
        console.error('Erro ao atualizar status:', error)
    }


}