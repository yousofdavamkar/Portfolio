import {fail} from '@sveltejs/kit';
import {adminClient,api} from '#lib/server/convex.js';
import type {Id} from '../../../convex/_generated/dataModel';
const text=(form:FormData,key:string)=>String(form.get(key)??'').trim();
const list=(form:FormData,key:string)=>text(form,key).split(',').map(s=>s.trim()).filter(Boolean);
export const load=async(event)=>{
  const {client,viewer}=await adminClient(event);
  const [content,inbox]=await Promise.all([client.query(api.portfolio.dashboard,{}),client.query(api.messages.inbox,{paginationOpts:{numItems:30,cursor:event.url.searchParams.get('cursor')}})]);
  event.setHeaders({'Cache-Control':'private, no-store'});
  return {...content,inbox,viewer};
};
export const actions={
  profile:async(event)=>{
    const {client}=await adminClient(event);const form=await event.request.formData();
    try{await client.mutation(api.portfolio.saveProfile,{name:text(form,'name'),role:text(form,'role'),bio:text(form,'bio'),journey:text(form,'journey'),experience:text(form,'experience'),email:text(form,'email'),github:text(form,'github'),linkedin:text(form,'linkedin'),skills:list(form,'skills'),available:form.has('available'),...(text(form,'resumeId')?{resumeId:text(form,'resumeId') as Id<'_storage'>}:{})});return {success:'Profile saved.'};}
    catch{return fail(400,{error:'Profile could not be saved. Check field lengths and use HTTPS links.'});}
  },
  project:async(event)=>{
    const {client}=await adminClient(event);const form=await event.request.formData();
    try{await client.mutation(api.portfolio.saveProject,{...(text(form,'id')?{id:text(form,'id') as Id<'projects'>}:{}),title:text(form,'title'),slug:text(form,'slug'),summary:text(form,'summary'),body:text(form,'body'),category:text(form,'category'),stack:list(form,'stack'),image:text(form,'image'),...(text(form,'imageId')?{imageId:text(form,'imageId') as Id<'_storage'>}:{}),url:text(form,'url'),order:Number(text(form,'order')),published:form.has('published')});return {success:'Project saved.'};}
    catch{return fail(400,{error:'Project could not be saved. Use a unique lowercase slug, an HTTPS URL, and valid field lengths.'});}
  },
  message:async(event)=>{const {client}=await adminClient(event);const form=await event.request.formData();const status=text(form,'status');if(status!=='new'&&status!=='read'&&status!=='archived')return fail(400,{error:'Invalid message status.'});await client.mutation(api.messages.mark,{id:text(form,'id') as Id<'messages'>,status});return {success:'Message updated.'};},
  upload:async(event)=>{
    const {client}=await adminClient(event);const form=await event.request.formData();const file=form.get('file');const target=text(form,'target');
    const allowed=target==='resume'?['application/pdf']:target==='project'?['image/png','image/jpeg','image/webp']:[];
    if(!(file instanceof File)||file.size===0||file.size>8*1024*1024||!allowed.includes(file.type))return fail(400,{error:'Choose a PNG, JPG, WebP or PDF up to 8 MB.'});
    const uploadUrl=await client.mutation(api.portfolio.uploadUrl,{});
    const response=await fetch(uploadUrl,{method:'POST',headers:{'Content-Type':file.type},body:file});
    if(!response.ok)return fail(502,{error:'Upload failed. Please try again.'});
    const {storageId}=await response.json();
    return {success:'File uploaded. Save your changes to attach it.',storageId,uploadTarget:text(form,'target')};
  },
};
