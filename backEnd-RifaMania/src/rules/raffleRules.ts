export const ALLOWED_TOTAL_NUMBERS = [25, 50, 100, 200, 500, 1000]

export function validateTotalNumbers(totalNumbers: number): boolean{
    return ALLOWED_TOTAL_NUMBERS.includes(totalNumbers)
}