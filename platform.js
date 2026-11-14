/* Lichtgestalter Phase 2B: three-module landing page. */
(()=>{
'use strict';
const legacyNav=window.nav, legacyRender=window.render;

const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tiles=[['Kundendaten verwalten','Kunden, Ansprechpartner und Projekte','Kunden','👥'],['Dokumente erstellen','Angebote, Rechnungen und Auftragsabwicklung','Pipeline','📄'],['Finanzdaten','Liquiditätsplanung, Kredite und Rentabilität','Finanzdaten','📈']];
function home(){return `<section class="lg-portal"><p class="lg-eyebrow">LICHTGESTALTER PLATTFORM</p><h2>Was möchtest du heute bearbeiten?</h2><p class="lg-sub">Wähle einen Arbeitsbereich. Alle Bereiche nutzen dieselbe Anmeldung und dieselbe Supabase-Datenbank.</p><div class="lg-tiles">${tiles.map(t=>`<button type="button" class="lg-tile" data-go="${t[2]}"><span class="lg-tile-icon">${t[3]}</span><strong>${t[0]}</strong><span>${t[1]}</span><span class="lg-tile-next">Öffnen →</span></button>`).join('')}</div></section>`}
function finance(){return `<section class="lg-finance"><iframe id="lg-finance-frame" title="Finanzdaten" src="liquiditaet.html" loading="eager"></iframe></section>`}
function bind(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>window.LGPlatform.open(b.dataset.go));}
window.LGPlatform={open(dest){view=dest;render()},home(){view='Startseite';render()}};
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='lg-home')window.LGPlatform.home()});
window.nav=function(){
 const n=document.getElementById('nav');if(!n)return;
 if(view==='Startseite'){n.innerHTML='';n.style.display='none';return}
 n.style.display='flex';
 if(view==='Finanzdaten'){n.innerHTML='<button type="button" id="lg-back">← Startseite</button><strong style="padding:10px">Finanzdaten</strong>';}
 else {legacyNav();const back=document.createElement('button');back.type='button';back.id='lg-back';back.textContent='← Startseite';n.prepend(back);}
 document.getElementById('lg-back').onclick=()=>window.LGPlatform.home();
};
window.render=function(){
 if(!cloudReady)return;
 if(view==='Startseite'||view==='Finanzdaten'){
  nav();document.getElementById('app').innerHTML=view==='Startseite'?home():finance();bind();
 }else legacyRender(),nav();
};
const oldLoad=window.lgLoad;
window.lgLoad=async function(...args){await oldLoad(...args);if(cloudReady){view='Startseite';render()}};
// Prevent a stale local view before auth; cloud.js owns authentication.
const css=document.createElement('style');css.textContent=`
.lg-portal{max-width:1100px;margin:42px auto;padding:10px 20px 50px}.lg-eyebrow{font-size:12px;letter-spacing:.16em;color:#64748b;font-weight:700}.lg-portal h2{font-size:30px;margin:12px 0}.lg-sub{color:#64748b;margin-bottom:30px}.lg-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.lg-tile{border:1px solid #d9e1e9;background:#fff;border-radius:16px;min-height:245px;text-align:left;padding:25px;display:flex;flex-direction:column;align-items:flex-start;gap:14px;box-shadow:0 4px 18px #0000000b;cursor:pointer}.lg-tile:hover{border-color:#52799e;box-shadow:0 9px 24px #00000016}.lg-tile-icon{font-size:35px}.lg-tile strong{font-size:19px;color:#172a40}.lg-tile>span:nth-of-type(2){color:#607083;line-height:1.45}.lg-tile-next{margin-top:auto;font-weight:700;color:#24547c}.lg-finance{height:calc(100vh - 165px);min-height:650px}.lg-finance iframe{width:100%;height:100%;border:0;border-radius:10px;background:#0c111c}#nav{flex-wrap:wrap;align-items:center}#lg-back{margin-right:12px!important}@media(max-width:760px){.lg-tiles{grid-template-columns:1fr}.lg-tile{min-height:175px}.lg-finance{height:calc(100vh - 135px)}}`;
document.head.appendChild(css);
})();