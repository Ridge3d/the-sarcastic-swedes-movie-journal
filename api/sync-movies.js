import {put} from '@vercel/blob';
import {timingSafeEqual} from 'node:crypto';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const secret=process.env.MOVIE_LOG_SYNC_SECRET;
 const supplied=(req.headers.authorization||'').replace(/^Bearer /i,'');
 if(!secret||!supplied||Buffer.byteLength(supplied)!==Buffer.byteLength(secret)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(secret)))return res.status(401).json({error:'Unauthorized'});
 try{
 const data=typeof req.body==='string'?JSON.parse(req.body):req.body;
 if(!Array.isArray(data?.movies)||data.movies.length>10000)return res.status(400).json({error:'Invalid list'});
 const movies=data.movies.map(m=>({title:String(m.title||'').slice(0,250),year:Number(m.year)||null,watched_date:/^\d{4}-\d{2}-\d{2}$/.test(m.watched_date||'')?m.watched_date:null})).filter(m=>m.title);
 await put('public/movie-log.json',JSON.stringify(movies),{access:'public',allowOverwrite:true,addRandomSuffix:false,contentType:'application/json',cacheControlMaxAge:60});
 return res.status(200).json({ok:true,count:movies.length});
 }catch(e){return res.status(500).json({error:'Sync failed'});}
}