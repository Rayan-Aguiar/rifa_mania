export const setToken = (token: string) =>{
    try {
        localStorage.setItem("token", token);
    }catch(error){
        console.error("Error setting token", error);
    }
}

export const removeToken = () => {
    try{
        localStorage.removeItem("token");
        window.location.href = '/'
    }
    catch(error){
        console.error("Error removing token", error);
    }
}

export const getToken = ():string | null => {
    return localStorage.getItem("access_token");
}