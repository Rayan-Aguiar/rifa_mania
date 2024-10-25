export const calculateRemainingDays = (drawDate: string): number => {
    const drawDateObj = new Date(drawDate);
    const today = new Date();
    const timeDifference = drawDateObj.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); 
    return daysRemaining >= 0 ? daysRemaining : 0;
};