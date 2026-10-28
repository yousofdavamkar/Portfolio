import { createSWRStore } from 'swr-store';
export const resumeStore=createSWRStore<{url:string|null}>({
  key:()=>'/api/resume',
  get:async()=>{const response=await fetch('/api/resume');if(!response.ok)throw new Error('Resume could not be loaded.');return response.json();},
  freshAge:60000,staleAge:300000,revalidateOnFocus:true,maxRetryCount:1,
});
