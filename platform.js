/* Lichtgestalter Phase 2B: three-module landing page. */
(()=>{
'use strict';
const legacyNav=window.nav, legacyRender=window.render;

const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tiles=[['Kundendaten verwalten','Kunden, Ansprechpartner und Projekte','Kunden','👥'],['Dokumente erstellen','Angebote, Rechnungen und Auftragsabwicklung','Pipeline','📄'],['Finanzdaten','Liquiditätsplanung, Kredite und Rentabilität','Finanzdaten','📈'],['Controlling','Einnahmen nach Kunden und Ausgaben nach Lieferanten','Controlling','📊'],['Concept Studio','Lichtkonzepte und Präsentationen erstellen','https://leonidas1003.github.io/concept-studio/','💡']];
function home(){return `<section class="lg-portal"><p class="lg-eyebrow">LICHTGESTALTER PLATTFORM</p><h2>Was möchtest du heute bearbeiten?</h2><p class="lg-sub">Wähle einen Arbeitsbereich. Alle Bereiche nutzen dieselbe Anmeldung und dieselbe Supabase-Datenbank.</p><div class="lg-tiles">${tiles.map(t=>`<button type="button" class="lg-tile" data-go="${t[2]}"><span class="lg-tile-icon">${t[3]}</span><strong>${t[0]}</strong><span>${t[1]}</span><span class="lg-tile-next">Öffnen →</span></button>`).join('')}</div></section>`}
function finance(){return `<section class="lg-finance"><iframe id="lg-finance-frame" title="Finanzdaten" src="${view==='Controlling'?'controlling.html':'liquiditaet.html'}?v=43" loading="eager"></iframe></section>`}
function bind(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const dest=b.dataset.go;if(dest==='https://leonidas1003.github.io/concept-studio/'){window.open(dest,'_blank','noopener,noreferrer');return;}window.LGPlatform.open(dest);});}
const routeKey='lg-platform-view-v21';
const oldRouteKey='lg-platform-view-v20';
const allowed=new Set(['Startseite','Kunden','Pipeline','Projekte','Finanzdaten','Controlling','Angebote','Auftragsbestätigungen','Rechnungen','Lieferscheine','Gutschriften','Einstellungen']);
function restoreRoute(){try{const v=sessionStorage.getItem(routeKey)||sessionStorage.getItem(oldRouteKey);return allowed.has(v)?v:'Startseite'}catch{return 'Startseite'}}
function rememberRoute(dest){try{sessionStorage.setItem(routeKey,dest)}catch{}}
window.LGPlatform={restore(){view=restoreRoute();render()},open(dest){view=dest;rememberRoute(dest);render()},home(){view='Startseite';rememberRoute(view);render()}};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin)return;
 if(e.data?.type==='lg-home')window.LGPlatform.home();
 if(e.data?.type==='lg-selection'){
  const bar=document.getElementById('lg-global-selection');
  if(!bar)return;
  if(!e.data.count||view!=='Finanzdaten'){bar.hidden=true;return}
  bar.hidden=false;
  bar.querySelector('[data-count]').textContent=e.data.count;
  bar.querySelector('[data-total]').textContent=e.data.total;
  bar.querySelector('[data-paid]').textContent=e.data.paid;
  bar.querySelector('[data-open]').textContent=e.data.open;
 }
});
const selectionBar=document.createElement('div');selectionBar.id='lg-global-selection';selectionBar.hidden=true;
selectionBar.innerHTML='<strong><span data-count>0</span> ausgewählt</strong><span>Gesamtbetrag: <b data-total></b></span><span>Bezahlt: <b data-paid></b></span><span>Noch offen: <b data-open></b></span><button type="button" id="lg-clear-selection">Auswahl aufheben</button>';
document.body.appendChild(selectionBar);
selectionBar.querySelector('button').onclick=()=>document.getElementById('lg-finance-frame')?.contentWindow?.postMessage({type:'lg-clear-selection'},location.origin);
window.nav=function(){
 const n=document.getElementById('nav');if(!n)return;
 if(view==='Startseite'){n.innerHTML='';n.style.display='none';return}
 n.style.display='flex';
 if(view==='Finanzdaten'||view==='Controlling'){n.innerHTML='<button type="button" id="lg-back">← Startseite</button><strong style="padding:10px">'+(view==='Finanzdaten'?'Finanzübersicht':'Controlling')+'</strong>';}
 else {legacyNav();const back=document.createElement('button');back.type='button';back.id='lg-back';back.textContent='← Startseite';n.prepend(back);}
 document.getElementById('lg-back').onclick=()=>window.LGPlatform.home();
};
window.render=function(){
 if(!cloudReady)return;
 if(!['Finanzdaten','Controlling'].includes(view))selectionBar.hidden=true;
 rememberRoute(view);
 if(view==='Startseite'||view==='Finanzdaten'||view==='Controlling'){
  nav();document.getElementById('app').innerHTML=view==='Startseite'?home():finance();bind();if(view==='Finanzdaten'||view==='Controlling'){const f=document.getElementById('lg-finance-frame');if(f)f.addEventListener('load',()=>f.contentWindow.postMessage({type:'lg-finance-open'},location.origin),{once:true})}
 }else {legacyRender();nav();rememberRoute(view);}
};
// cloud.js calls LGPlatform.restore() after authentication; avoid racing two render calls.
// Prevent a stale local view before auth; cloud.js owns authentication.
const css=document.createElement('style');css.textContent=`
.lg-portal{max-width:1100px;margin:42px auto;padding:10px 20px 50px}.lg-eyebrow{font-size:12px;letter-spacing:.16em;color:#64748b;font-weight:700}.lg-portal h2{font-size:30px;margin:12px 0}.lg-sub{color:#64748b;margin-bottom:30px}.lg-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.lg-tile{border:1px solid #d9e1e9;background:#fff;border-radius:16px;min-height:245px;text-align:left;padding:25px;display:flex;flex-direction:column;align-items:flex-start;gap:14px;box-shadow:0 4px 18px #0000000b;cursor:pointer}.lg-tile:hover{border-color:#52799e;box-shadow:0 9px 24px #00000016}.lg-tile-icon{font-size:35px}.lg-tile strong{font-size:19px;color:#172a40}.lg-tile>span:nth-of-type(2){color:#607083;line-height:1.45}.lg-tile-next{margin-top:auto;font-weight:700;color:#24547c}.lg-finance{height:calc(100vh - 165px);min-height:650px}.lg-finance iframe{width:100%;height:100%;border:0;border-radius:10px;background:#0c111c}#nav{flex-wrap:wrap;align-items:center}#lg-back{margin-right:12px!important}@media(max-width:760px){.lg-tiles{grid-template-columns:1fr}.lg-tile{min-height:175px}.lg-finance{height:calc(100vh - 135px)}}`;
css.textContent+=`#lg-global-selection{position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#23314a;color:#fff;border-top:1px solid #61749a;box-shadow:0 -8px 28px #0008;padding:14px 22px;display:flex;gap:24px;align-items:center;flex-wrap:wrap}#lg-global-selection[hidden]{display:none!important}#lg-global-selection button{margin-left:auto;background:#587fe9;color:white}`;
document.head.appendChild(css);
})();