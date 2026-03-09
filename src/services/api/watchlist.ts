import axios from "axios";
import { BASE_URL, getAuthHeaders } from "./config";

export const fetchWatchList=async()=>{
    const token=localStorage.getItem('bearer_token');
    if(!token){
        throw new Error("No bearer token found in storage");
    }
    try {
        const response=await axios.get(
            `${BASE_URL}/v1/api/watchlist/list`,
            {
            headers:getAuthHeaders(token||""),
            }
        );
    return response.data
    } catch (error:any) {
        console.log("Error in fetching all watchlists",error.response?.data);
        throw error;
    }
}
//fetch specific watchlist details 
export const fetchWatchlistScripts=async(watchlistId:number)=>{
    const token=localStorage.getItem('bearer_token');
    try {
        const response=await axios.post(
            `${BASE_URL}/v1/api/watchlist/scrips/list`,
            {
                watchlistId
            },
            {
            headers:getAuthHeaders(token||"")
            }
        );
    return response.data;
    } catch (error:any) {
        console.log("Error in fetching details for specific watchlist",error.response?.data);
        throw error;
    }
}
