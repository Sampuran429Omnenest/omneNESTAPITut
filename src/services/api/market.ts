import axios from "axios";
import { BASE_URL, getAuthHeaders } from "./config";

export const getMarketStatus=async()=>{
    const token=localStorage.getItem('bearer_token');
    
    try {
        const response=await axios.post(
            `${BASE_URL}/v2/api/stocks/market-status`,
            {},
            {
                headers:getAuthHeaders(token || "")
            }
        );
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Market Status Api Error",error);
        throw error;
    }
}