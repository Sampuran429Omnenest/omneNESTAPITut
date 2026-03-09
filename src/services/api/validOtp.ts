import axios from "axios";
import { BASE_URL, getAuthHeaders } from "./config";

export const validateOtp=async(username:string,otpValue:string)=>{
    const body={
        username:username,
        otp:Number(otpValue),
    };
    console.log(body);
    try {
        const response=await axios.post(
            `${BASE_URL}/v2/api/auth/validate-otp`,
            body,
            {
                headers:getAuthHeaders()
            }
        );
        return response.data;
    } catch (error:any) {
        console.error("OTP validation error",error.response?.data)
        throw error;
    }
}