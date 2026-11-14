/* Phase 2A – Gemeinsame Finanzansicht, zunächst nur lesend. */
(()=>{
'use strict';
const pages=['Finanzübersicht','Buchungen','Teilzahlungen','Kredite','Wiederholungen','Rentabilität','Finanzeinstellungen'];
const tabs={Buchungen:'fin_entries',Teilzahlungen:'fin_entry_payments',Kredite:'fin_loans',Wiederholungen:'fin_recurrences',Rentabilität:'fin_profit_plans',Finanzeinstellungen:'fin_settings'};
let data={},ready=false,busy=false,error='';
const escFin=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(v)||0);
const date=v=>v?String(v).slice(0,10).split('-').reverse().join('.'):'–';
const sum=(arr,k)=>arr.reduce((s,r)=>s+(Number(r[k])||0),0);
const grid=(rows,cols)=>!rows.length?'<div class="panel" style="padding:24px">Keine Datensätze.</div>':`<div class="panel tablewrap"><table><thead><tr>${cols.map(c=>`<th>${escFin(c[0])}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${escFin(c[1](r))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
function page(name){
 let content='';
 if(busy)content='<div class="panel" style="padding:24px">Finanzdaten werden geladen …</div>';
 else if(error)content=`<div class="panel" style="padding:24px;color:#ad2638">${escFin(error)} – bitte RLS und Berechtigungen prüfen.</div>`;
 else if(!ready)content='<div class="panel" style="padding:24px">Finanzdaten noch nicht geladen.</div>';
 else{
 const entries=data.fin_entries||[],payments=data.fin_entry_payments||[],plans=data.fin_profit_plans||[];
 if(name==='Finanzübersicht'){
  const year=String(new Date().getFullYear()),current=plans.filter(x=>String(x.expected_date||'').startsWith(year));
  content=`<div class="stats"><div class="stat">Einnahmen (Buchungen)<b>${money(sum(entries.filter(x=>x.kind==='income'),'amount'))}</b></div><div class="stat">Ausgaben (Buchungen)<b>${money(sum(entries.filter(x=>x.kind==='expense'),'amount'))}</b></div><div class="stat">Erfasste Teilzahlungen<b>${money(sum(payments,'amount'))}</b></div><div class="stat">Geplantes Ergebnis ${year}<b>${money(sum(current,'revenue')-sum(current,'costs'))}</b></div></div><div class="panel" style="padding:22px"><h3>Übernommene Finanzdaten</h3><p>${entries.length} Buchungen · ${payments.length} Teilzahlungen · ${(data.fin_loans||[]).length} Kredite · ${(data.fin_recurrences||[]).length} Wiederholungen · ${plans.length} Rentabilitätspläne</p><p>Hinweis: Buchungssummen sind keine bestätigten Kontostände. Teilzahlungen werden separat angezeigt und nicht doppelt addiert.</p><p>Diese erste Integration ist schreibgeschützt. Automatische Rechnungs-Synchronisierung ist noch nicht aktiviert.</p></div>`;
 }else if(name==='Buchungen')content=grid(entries.slice().sort((a,b)=>String(b.due_date).localeCompare(String(a.due_date))),[['Fällig',r=>date(r.due_date)],['Art',r=>r.kind],['Bezeichnung',r=>r.name],['Betrag',r=>money(r.amount)],['Status',r=>r.status],['Rechnung',r=>r.invoice_no||'–']]);
 else if(name==='Teilzahlungen')content=grid(payments,[['Datum',r=>date(r.paid_date)],['Buchung',r=>(entries.find(e=>e.id===r.entry_id)||{}).name||r.entry_id],['Betrag',r=>money(r.amount)]]);
 else if(name==='Kredite')content=grid(data.fin_loans||[],[['Kredit',r=>r.name],['Darlehen',r=>money(r.principal)],['Zins p. a.',r=>r.annual_rate+' %'],['Rate',r=>money(r.payment)],['Beginn',r=>date(r.first_due)],['Aktiv',r=>r.active?'Ja':'Nein']]);
 else if(name==='Wiederholungen')content=grid(data.fin_recurrences||[],[['Bezeichnung',r=>r.name],['Art',r=>r.kind],['Betrag',r=>money(r.amount)],['Intervall',r=>r.frequency],['Beginn',r=>date(r.start_date)],['Aktiv',r=>r.active?'Ja':'Nein']]);
 else if(name==='Rentabilität')content='<p class="muted">Gesamte Rentabilitätsplanung. Eine automatische Zuordnung zu Kunden-IDs erfolgt erst nach Prüfung der Kundenbezeichnungen.</p>'+grid(plans,[['Datum',r=>date(r.expected_date)],['Kunde',r=>r.customer],['Projekt',r=>r.project],['Umsatz',r=>money(r.revenue)],['Kosten',r=>money(r.costs)],['Ergebnis',r=>money(Number(r.revenue)-Number(r.costs))]]);
 else content=grid(data.fin_settings||[],[['Schlüssel',r=>r.key],['Wert',r=>r.value]]);
 }
 return `<div class="toolbar"><h2>${escFin(name)}</h2><button class="secondary" onclick="LGFinance.reload()">Aktualisieren</button></div>${content}`;
}
async function reload(){if(!window.cloudClient||!cloudReady)return;busy=true;error='';render();try{const out={};for(const t of Object.values(tabs)){let rows=[],start=0;while(true){const res=await cloudClient.from(t).select('*').range(start,start+999);if(res.error)throw Error(t+': '+res.error.message);rows.push(...(res.data||[]));if(!res.data||res.data.length<1000)break;start+=1000;if(start>100000)throw Error('Datenlimit überschritten')}out[t]=rows;}data=out;ready=true;}catch(e){error=e.message;ready=false}finally{busy=false;render()}}
const originalNav=window.nav,originalRender=window.render;
window.nav=function(){originalNav();const n=document.getElementById('nav');if(!n)return;const label=document.createElement('span');label.textContent='Finanzen:';label.style.cssText='align-self:center;color:#89919c;padding:0 8px';n.appendChild(label);pages.forEach(name=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.className=view===name?'active':'';b.onclick=()=>{view=name;render();if(!ready&&!busy)void reload()};n.appendChild(b)})};
window.render=function(){if(pages.includes(view)){nav();document.getElementById('app').innerHTML=page(view)}else originalRender()};
window.LGFinance={reload,open:(name='Finanzübersicht')=>{view=name;render();if(!ready&&!busy)void reload()}};
const originalLoad=window.lgLoad;
window.lgLoad=async function(...args){await originalLoad(...args);if(cloudReady)void reload()};
})();
