import {error} from '@sveltejs/kit';
export const load=async({parent,params})=>{const {content}=await parent();const project=content.projects.find(p=>p.slug===params.slug);if(!project)error(404,'Project not found');return {project};};
