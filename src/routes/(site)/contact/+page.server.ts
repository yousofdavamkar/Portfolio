import {fail} from '@sveltejs/kit';
import {createHmac} from 'node:crypto';
import {CONTACT_SECRET} from '$app/env/private';
import {convex,api} from '#lib/server/convex.js';
export const actions={default:async({request,getClientAddress})=>{
  const data=await request.formData();
  const name=String(data.get('name')??'').trim(),email=String(data.get('email')??'').trim(),message=String(data.get('message')??'').trim();
  if(data.get('website'))return {success:true};
  if(!name||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||message.length<10||message.length>5000)return fail(400,{error:'Please enter your name, a valid email, and a message of 10–5,000 characters.',name,email,message});
  if(!CONTACT_SECRET)return fail(503,{error:'Messaging is temporarily unavailable. Please try again later.',name,email,message});
  try {
    const key=createHmac('sha256',CONTACT_SECRET).update(getClientAddress()).digest('hex');
    await convex().mutation(api.messages.send,{name,email,message,key,secret:CONTACT_SECRET});
    return {success:true};
  }catch{return fail(429,{error:'Your message could not be sent. Please wait a little and try again.',name,email,message});}
}};
