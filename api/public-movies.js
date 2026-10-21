import {list} from '@vercel/blob';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{
 const items=await list({prefix:'public/movie-log.json',limit:10});
 const entry=items.blobs.find(x=>x.pathname==='public/movie-log.json');
 if(!entry)return res.status(200).json({movies:[]});
 const r=await fetch(entry.url,{cache:'no-store'});
 if(!r.ok)throw Error('Blob fetch failed');
 const movies=await r.json();
 return res.status(200).json({movies:Array.isArray(movies)?movies:[]});
 }catch(e){return res.status(503).json({error:'Movie list unavailable'});}
}