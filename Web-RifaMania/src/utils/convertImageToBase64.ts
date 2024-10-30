export const convertImageToBase64  = (file: File): Promise<string> =>{
    return new Promise((resolve, reject) =>{
        const reader = new FileReader();

        reader.onloadend = () =>{
            resolve(reader.result as string);
        }

        reader.onerror = () => {
            reject(new Error('Failed to convert file to base64'))
        }

        reader.readAsDataURL(file);
    })
}