import jwt from 'jsonwebtoken';
import { env } from '../env';

export const verifyToken = (token: string) =>{
    return new Promise((resolve, reject) =>{
        jwt.verify(token, env.JWT_SECRET, (err, decoded)=>{
            if(err){
                return reject(err);
            }
            resolve(decoded);
        })
    })
}