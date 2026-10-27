import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import nextServer from 'next/server.js';
const {NextRequest}=nextServer;
const __dirname=path.dirname(fileURLToPath(import.meta.url));
// Compile the real route with the installed TypeScript compiler, without modifying its source.
const sourcePath = path.resolve(__dirname,'../app/api/backend/[...path]/route.ts');
const compiled=ts.transpileModule(fs.readFileSync(sourcePath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const loaded=new Module(sourcePath);loaded.filename=sourcePath;loaded.paths=Module._nodeModulePaths(path.dirname(sourcePath));loaded._compile(compiled,sourcePath);
const GET=loaded.exports.GET;
const context=parts=>({params:Promise.resolve({path:parts})});
function request(route,cookie){return new NextRequest(`https://zenitsalon.com/api/backend/${route}`,{headers:cookie?{cookie}: {}});}
test('Sesión administrativa: estados normales y permisos conservados',async t=>{
 const original=global.fetch;const old=process.env.ZENIT_API_URL;process.env.ZENIT_API_URL='https://api.example.com';let calls=[];
 try{
 await t.test('sin cookie: 200 sin consultar al backend',async()=>{
  global.fetch=async()=>{throw Error('No debe consultar al backend');};
  const r=await GET(request('api/auth/session?owner=1'),context(['api','auth','session']));assert.equal(r.status,200);assert.deepEqual(await r.json(),{authenticated:false});assert.equal(r.headers.get('cache-control'),'no-store');
 });
 await t.test('cookie válida: verifica el rol en el backend, sin devolver datos privados',async()=>{
  global.fetch=async(url,options)=>{calls.push(String(url));assert.equal(options.headers.get('authorization'),'Bearer owner-valid');return Response.json({customer:{id:'private-id',role:'ADMIN',name:'Private name'}});};
  const r=await GET(request('api/auth/session?owner=1','zenit_owner_session=owner-valid'),context(['api','auth','session']));assert.deepEqual(await r.json(),{authenticated:true});assert.equal(calls.at(-1),'https://api.example.com/api/auth/me');
 });
 await t.test('cookie vencida: 200 con sesión ausente y cookie eliminada',async()=>{
  global.fetch=async()=>Response.json({error:'Sesión vencida'},{status:401});
  const r=await GET(request('api/auth/session?owner=1','zenit_owner_session=expired'),context(['api','auth','session']));assert.equal(r.status,200);assert.deepEqual(await r.json(),{authenticated:false});assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
 });
 await t.test('cookie de un cliente no habilita la sesión de propietaria',async()=>{
  global.fetch=async()=>Response.json({customer:{role:'CUSTOMER'}});
  const r=await GET(request('api/auth/session?owner=1','zenit_owner_session=customer-token'),context(['api','auth','session']));assert.deepEqual(await r.json(),{authenticated:false});
 });
 await t.test('los errores reales del backend siguen visibles',async()=>{
  global.fetch=async()=>Response.json({error:'No disponible'},{status:503});
  const r=await GET(request('api/auth/session?owner=1','zenit_owner_session=present'),context(['api','auth','session']));assert.equal(r.status,503);assert.equal((await r.json()).error,'No disponible');
 });
 await t.test('los endpoints privados conservan su respuesta 401',async()=>{
  global.fetch=async()=>Response.json({error:'Debés iniciar sesión'},{status:401});
  const r=await GET(request('api/admin/products'),context(['api','admin','products']));assert.equal(r.status,401);
 });
 }finally{global.fetch=original;if(old===undefined)delete process.env.ZENIT_API_URL;else process.env.ZENIT_API_URL=old;}
});
