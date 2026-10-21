(()=>{'use strict';
const KEY='movieTrackerWatchedMovies_v2',SECRET_KEY='movieJournalSyncSecret_v1';
const parse=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}};
const normalize=()=>{const raw=parse();const items=Array.isArray(raw)?raw:Object.values(raw||{});return items.filter(x=>x&&typeof x==='object').map(x=>{
 const title=x.title||x.name||'';
 const year=+(x.release_year||x.year||String(x.release_date||'').slice(0,4))||null;
 const date=x.completed_at||x.watched_at||x.dateWatched||x.watchedDate||x.date_watched||'';
 return {title,year,watched_date:/^\d{4}-\d{2}-\d{2}/.test(String(date))?String(date).slice(0,10):null};
 }).filter(x=>x.title)};
let busy=false,last='';
async function sync(){const secret=localStorage.getItem(SECRET_KEY);if(!secret||busy)return;const movies=normalize(),payload=JSON.stringify({movies});if(payload===last)return;busy=true;try{const r=await fetch('/api/sync-movies',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+secret},body:payload});if(r.ok){last=payload;setStatus('Movie Log synced: '+movies.length+' movies')}else{setStatus('Movie Log sync needs attention ('+r.status+')')}}catch{setStatus('Movie Log sync unavailable; will retry')}finally{busy=false}}
function setStatus(msg){const el=document.getElementById('movie-sync-status');if(el)el.textContent=msg}
function setup(){if(document.getElementById('movie-sync-control'))return;const el=document.createElement('div');el.id='movie-sync-control';el.style.cssText='position:fixed;bottom:12px;right:12px;z-index:1000;background:#1c1c1e;color:white;border:1px solid #666;border-radius:10px;padding:9px;max-width:260px;font:12px system-ui;box-shadow:0 4px 15px #0008';el.innerHTML='<div id="movie-sync-status">Movie Log sync</div><button id="movie-sync-config" type="button" style="margin-top:5px">Sync settings</button>';document.body.append(el);el.querySelector('button').onclick=()=>{const value=prompt('Enter your private Movie Log sync key (stored only on this device):',localStorage.getItem(SECRET_KEY)||'');if(value===null)return;if(value.trim())localStorage.setItem(SECRET_KEY,value.trim());else localStorage.removeItem(SECRET_KEY);last='';sync()};setStatus(localStorage.getItem(SECRET_KEY)?'Movie Log sync enabled':'Movie Log sync: enter key in Sync settings');sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
window.addEventListener('storage',sync);setInterval(sync,20000);
})();