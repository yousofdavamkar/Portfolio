import {readFileSync,appendFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const path='.env.local';const env=readFileSync(path,'utf8');
const get=name=>env.match(new RegExp(`^${name}=(.*)$`,'m'))?.[1]?.trim();
const secret=get('CONTACT_SECRET')||randomBytes(32).toString('hex');
const email=get('STUDIO_EMAIL')||'owner@portfolio.local';
const password=get('STUDIO_PASSWORD')||randomBytes(24).toString('base64url');
function run(args){const r=spawnSync('npx',['convex',...args],{encoding:'utf8'});if(r.status!==0){throw new Error('Convex setup failed. Check deployment access.');}}
if(!get('CONTACT_SECRET')){run(['env','set','CONTACT_SECRET',secret]);appendFileSync(path,`\nCONTACT_SECRET=${secret}\n`);}
if(!get('STUDIO_PASSWORD')){run(['run','admin:provision',JSON.stringify({email,password})]);appendFileSync(path,`\n# Development studio login, never commit or expose through PUBLIC_ variables\nSTUDIO_EMAIL=${email}\nSTUDIO_PASSWORD=${password}\n`);}
console.log('Development studio account and contact configuration ready. Credentials saved in ignored .env.local.');
