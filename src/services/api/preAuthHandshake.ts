import axios from "axios";
import { BASE_URL, getAuthHeaders, STATIC_PUBLIC_KEY } from "./config";

export const preAuthHandShake = async ()=>{
    try {
        const response=await axios.post(
            `${BASE_URL}/v1/api/auth/pre-auth-handshake`,
            {
                devicePublicKey:STATIC_PUBLIC_KEY
            },
            {
                headers:getAuthHeaders()
            }
        );
        console.log("PreAuthHandshake done",response.data);
    } catch (error:any) {
        console.log("Pre auth handshake error",error.message);
        throw error;
    }
}