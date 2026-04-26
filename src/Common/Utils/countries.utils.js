import axios from "axios";

export const getCountryCodeByIp = async (ip)=>{
    const result = await axios.get(`https://ipapi.co/${ip}/json/`)
    return result.data.country_code
}