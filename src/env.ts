import {defineEnvVars} from '@sveltejs/kit/env';
export const variables=defineEnvVars({
 PUBLIC_CONVEX_URL:{public:true,schema:(value)=>{if(!value)throw new Error('PUBLIC_CONVEX_URL is required');return new URL(value).origin;}},
 CONTACT_SECRET:{schema:(value)=>value??''},
});
