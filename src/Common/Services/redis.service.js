import { redisClient } from "../Clients/index.js";

export const set = ({key , value , options ={}})=>{
    return redisClient.set(key , value , options)
}

export const get = ({key})=>{
    return redisClient.get(key)
}

export const expire = ({key , seconds})=>{
    return redisClient.expire(key , seconds)
}

export const TTL = ({key})=>{
    return redisClient.ttl(key)
}

export const del = ({key})=>{
    return redisClient.del(key)
}

// get all keys
export const keys = (pattern = '*')=>{
    return redisClient.keys(pattern)
}

export const hset = ({key , field , value})=>{
    return redisClient.hset(key , field , value)
}

const calculateTokenTTL = (time)=>{
    const currentTime  = Math.floor(Date.now() / 1000)
    return time - currentTime
}

export const blackListToken = ({key , exp}) => {
  let ttlSeconds;
  if(exp){
    ttlSeconds = calculateTokenTTL(exp)
  }

  if( ttlSeconds <= 0){
    console.log(`This token is already expired`);
    return
  }

  return set({key , value:'true' , options:{EX: ttlSeconds}})
}