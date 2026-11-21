/* Angebotsstudio V55 – runs inside the existing authenticated app.
   Data: existing state.docs / lg_records, no new database tables. */
const LGStudio=(()=>{
 'use strict';
 let current=null, dirty=false, selectedCustomer=null;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 const isStudio=d=>d?.studio===true&&['Q','C'].includes(d.type);
 const list=()=>state.docs.filter(isStudio);
 const locked=d=>docApproval(d)!=='draft';
 const cleanHtml=html=>{
  const root=document.createElement('div');root.innerHTML=String(html||'');
  const allowed=new Set(['P','DIV','SPAN','BR','B','STRONG','I','EM','U','S','H1','H2','H3','H4','UL','OL','LI','TABLE','THEAD','TBODY','TR','TH','TD','IMG','BLOCKQUOTE','HR','A']);
  for(const el of [...root.querySelectorAll('*')]){
   if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);continue}
   for(const attr of [...el.attributes]){
    const name=attr.name.toLowerCase(),value=attr.value;
    if(name==='style'){el.removeAttribute(attr.name);continue}
    if(name==='src'&&el.tagName==='IMG'&&/^https:\/\//i.test(value))continue;
    if(name==='href'&&el.tagName==='A'&&/^https:\/\//i.test(value))continue;
    if(!['alt','colspan','rowspan'].includes(name))el.removeAttribute(attr.name);
   }
  }
  return root.innerHTML;
 };
 const initial=()=>'<h2>Leistungsbeschreibung</h2><p>Vielen Dank für Ihre Anfrage. Gerne bieten wir Ihnen folgende Leistungen an:</p><p><br></p><h3>Hinweise zur Ausführung</h3><p>Hier können Sie weitere Informationen ergänzen.</p>';
 const css=`<style id="lg-studio-style">
 #app .as-shell{max-width:1200px;margin:auto}.as-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:22px}
 #app .as-actions{display:flex;gap:9px;flex-wrap:wrap}#app .as-canvas{background:#fff;color:#1c2430;max-width:860px;margin:18px auto;padding:60px 65px 80px;min-height:950px;box-shadow:0 8px 36px #0002;border:1px solid #d5dbe4;font-family:Arial,sans-serif}
 #app .as-lock{user-select:text;border-bottom:1px solid #d8dde4;padding-bottom:18px;margin-bottom:20px;display:flex;justify-content:space-between;gap:18px}
 #app .as-lock img{max-width:175px;max-height:85px;object-fit:contain}#app .as-address{white-space:pre-line;font-size:12px;line-height:1.65}
 #app .as-body{min-height:180px;line-height:1.6;outline:1px dashed #b8c5d5;padding:12px;overflow-wrap:anywhere}
 #app .as-body:focus{outline:2px solid #5678b8}#app .as-body table{border-collapse:collapse;width:100%;margin:14px 0}#app .as-body td,#app .as-body th{border:1px solid #b7c2d0;padding:7px}
 #app .as-position{width:100%;border-collapse:collapse;font-size:13px}#app .as-position th,#app .as-position td{padding:8px;border:1px solid #d5dce5}#app .as-position input{min-width:0;width:100%;padding:7px;font-size:13px}
 #app .as-position th{background:#e7edf4;color:#172338}#app .as-position .as-narrow{width:75px}#app .as-position .as-price{width:110px}
 #app .as-choice{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}#app .as-choice button{min-height:140px;font-size:18px}#app .as-editor-layout{display:grid;grid-template-columns:minmax(0,1fr) 185px;gap:18px;align-items:start}#app .as-editor-layout .as-canvas{margin:0;min-width:0;padding:40px}#app .as-editor-layout .as-tools{position:sticky;top:15px;display:flex;flex-direction:column;gap:8px;background:#1c2b40}#app .as-editor-layout .as-tools button{width:100%}@media(max-width:900px){#app .as-editor-layout{grid-template-columns:1fr}#app .as-editor-layout .as-tools{position:static;flex-direction:row}}
 #app .as-tools{display:flex;gap:5px;flex-wrap:wrap;padding:10px;background:#e9eef5;border-radius:10px;margin:16px 0}#app .as-tools button{padding:7px 10px;font-size:13px}
 #app .as-protected{margin-top:38px;text-align:right;font-size:11px;color:#5b6573;border-top:1px solid #ddd;padding-top:16px}
 #app .as-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0}#app .as-meta label{font-size:12px}
 #app .as-meta input,#app .as-meta select{width:100%}#app .as-list{width:100%}#app .as-list td{padding:13px}
 #app .as-canvas{position:relative!important;background:#fff!important;color:#171717!important;font-family:Arial,Helvetica,sans-serif!important;max-width:860px!important;padding:100px 190px 85px 62px!important;min-height:1120px!important;font-size:12px!important;line-height:1.45!important}
 #app .as-lock{min-height:180px!important;display:block!important;border:0!important;padding:0!important;margin-bottom:16px!important}
 #app .as-lock img{position:absolute;right:24px;top:28px;max-width:170px!important;max-height:70px!important}
 #app .as-address{font-size:12px!important;white-space:pre-line!important;padding-top:45px!important}
 #app .as-canvas>h2{font-size:15px!important;font-style:italic;font-weight:800!important;margin-top:15px!important}
 #app .as-protected{position:absolute!important;right:20px!important;top:640px!important;width:135px!important;text-align:right!important;border:0!important;font-size:9px!important;line-height:1.5!important;color:#777!important}
 #app .as-position th{background:#bcbcbc!important;color:#111!important;font-size:11px!important}
 #app .as-position td{border:0!important;border-bottom:1px solid #dedede!important}
 @media(max-width:850px){#app .as-canvas{padding:90px 25px 90px 30px!important}#app .as-protected{position:static!important;width:auto!important;text-align:right!important}}
 #app .as-free-table{border-collapse:collapse;width:100%;margin:12px 0 22px;font-size:12px}
 #app .as-free-table th{background:#bdbfc0!important;color:#111!important;font-weight:700;padding:9px;border:1px solid #b6b6b6}
 #app .as-free-table td{padding:9px;border:1px solid #b6b6b6;min-width:35px}
 #app .as-free-controls{display:flex;gap:6px;justify-content:flex-end;margin-top:16px}
 #app .as-free-controls button{font-size:11px;padding:5px}
 #app .as-position thead th span[contenteditable=true]{display:block;min-width:35px;outline:1px dashed #777;padding:3px}
 #app .as-position{table-layout:auto}
 #app .as-canvas .as-money{font-size:13px}
 #app .as-external-card{max-width:1000px;margin:auto;padding:26px;border-radius:14px}#app .as-external-card input,#app .as-external-card textarea{width:100%;margin-top:6px}#app .as-external-card label{display:block;font-size:13px;font-weight:600}#app .as-number{font-size:25px;font-weight:800;letter-spacing:.05em;padding:16px 20px;border:1px solid #70819a;border-radius:10px;display:inline-block;margin:8px 0 16px}#app .as-message{font-size:13px;color:#5a6472;margin-top:10px}#app .as-money{text-align:right;margin-top:12px;font-weight:bold}
 @media(max-width:700px){#app .as-canvas{padding:20px;min-height:650px}#app .as-meta{grid-template-columns:1fr}#app .as-lock img{max-width:100px}}
 @media print{#app .as-tools,#app .as-actions,#app .as-meta,#app .as-message{display:none!important}}
 </style>`;
 function page(){
  if(!document.getElementById('lg-studio-style'))document.head.insertAdjacentHTML('beforeend',css);
  const rows=list().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return `<section class="as-shell"><div class="as-head"><div><h2>Angebotsstudio</h2><p class="muted">Individuelle Angebote gestalten – mit geschütztem Briefkopf und strukturierten Rechnungspositionen.</p></div><button onclick="LGStudio.newQuote()">+ Individuelles Angebot</button></div>
  <div class="panel tablewrap"><table class="as-list"><thead><tr><th>Dokument</th><th>Kunde</th><th>Datum</th><th>Status</th><th>Netto</th><th>Aktionen</th></tr></thead><tbody>
  ${rows.map(d=>`<tr><td>${escape(d.number||'Entwurf')} · ${d.type==='Q'?'Angebot':'Auftragsbestätigung'}</td><td>${escape(cust(d.customerId)?.name||'—')}</td><td>${escape(d.date)}</td><td>${d.externalPendingPdf?'PDF ausstehend':locked(d)?'Freigegeben':'Entwurf'}</td><td>${eur(d.external?d.externalNet:amount(d))}</td><td><button class="secondary" onclick="LGStudio.open('${d.id}')">${locked(d)?'Ansehen':'Bearbeiten'}</button> ${d.type==='Q'&&locked(d)&&!d.externalPendingPdf?`<button class="secondary" onclick="${d.external?'LGStudio.manualDoc':'LGStudio.order'}('${d.id}'${d.external?",'C'":''})">In Auftrag</button>`:''} ${locked(d)&&!d.externalPendingPdf?`<button class="secondary" onclick="${d.external?'LGStudio.manualDoc':'LGStudio.invoice'}('${d.id}'${d.external?",'I'":''})">Rechnung erstellen</button>`:''} ${!locked(d)?`<button class="danger" onclick="LGStudio.deleteDraft('${d.id}')">Entwurf löschen</button>`:''}</td></tr>`).join('')}
  </tbody></table>${rows.length?'':'<div class="empty">Noch keine individuellen Angebote vorhanden.</div>'}</div></section>`;
 }
 function oldNewQuote(){
  const choices=state.customers.map((c,i)=>`${i+1}: ${c.name}`).join('\n');
  if(!state.customers.length)return alert('Bitte zuerst unter „Kundendaten“ einen Kunden anlegen.');
  const choice=prompt('Kunden auswählen (Nummer eingeben):\n'+choices);
  if(choice===null)return;
  const c=state.customers[Number(choice)-1];
  if(!c)return alert('Bitte eine gültige Kundennummer aus der Liste wählen.');
  const projects=state.projects.filter(p=>p.customerId===c.id);const chosen=projects.length?prompt('Projekt wählen (Nummer) oder leer für kein Projekt:\\n'+projects.map((p,i)=>`${i+1}: ${p.name||p.title||p.number||p.id}`).join('\\n'),''):'';if(chosen===null)return;const projectId=chosen?projects[Number(chosen)-1]?.id:'';if(chosen&&!projectId)return alert('Ungültige Projektauswahl.');
  const d={id:id(),type:'Q',studio:true,number:'',approvalState:'draft',status:'Entwurf',customerId:c.id,projectId:projectId||'',date:today(),vat:Number(state.settings.vat??19),lines:[{id:id(),sku:'',description:'Neue Position',qty:1,price:0,discount:0,percent:100}],studioTop:initial(),studioBottom:'<p>Wir freuen uns auf die Zusammenarbeit.</p>',notes:'',introText:'',outroText:'',deliveryTerm:'',serviceDate:'',payment:'Zahlbar sofort ohne Abzug'};
  state.docs.push(d);save();open(d.id);
 }
 function newQuote(){
  if(!state.customers.length)return alert('Bitte zuerst einen Kunden in der Kundenverwaltung anlegen.');
  const app=document.getElementById('app');
  app.innerHTML=`<section class="as-shell"><h2>Kunde auswählen</h2><div class="panel"><select id="as-customer"><option value="">Kunde auswählen</option>${state.customers.map(c=>`<option value="${escape(c.id)}">${escape(c.name)}</option>`).join('')}</select><div id="as-choice" class="as-choice" style="display:none"><button onclick="LGStudio.external()">📎 Externes Angebot hochladen</button><button onclick="LGStudio.internal()">✍️ Frei gestaltbares Angebot</button></div></div><button onclick="LGStudio.back()">Zurück</button></section>`;
  app.querySelector('#as-customer').onchange=e=>{selectedCustomer=e.target.value;app.querySelector('#as-choice').style.display=selectedCustomer?'grid':'none'};
 }
 function internal(){
  const c=cust(selectedCustomer);if(!c)return alert('Kunden auswählen.');
  const projects=state.projects.filter(p=>p.customerId===c.id);
  document.getElementById('app').innerHTML=`<section class="as-shell"><div class="as-head"><div><h2>Projekt für das Angebot wählen</h2><p class="muted">Kunde: ${escape(c.name)}</p></div><button class="secondary" onclick="LGStudio.newQuote()">← Zurück</button></div>
  <div class="panel as-external-card"><h3>Bestehendes Projekt auswählen</h3>
  ${projects.length?`<div style="display:grid;gap:10px">${projects.map(p=>`<button class="secondary" style="text-align:left;padding:18px" onclick="LGStudio.startInternal('${p.id}')"><b>${escape(p.number||'Ohne Projektnummer')}</b> · ${escape(p.name||'Unbenanntes Projekt')}</button>`).join('')}</div>`:'<p>Für diesen Kunden ist noch kein Projekt angelegt.</p>'}
  <hr><h3>Neues Projekt anlegen</h3><form id="as-new-project"><div class="as-meta"><label>Projektname *<input name="name" required placeholder="z. B. Lichtplanung Empfang"></label><label>Projektnummer<input name="number" placeholder="Projektnummer gemäß eurem Nummernkreis"></label></div><button type="submit">Projekt anlegen und Angebot öffnen</button></form></div></section>`;
  document.getElementById('as-new-project').onsubmit=async e=>{
   e.preventDefault();const form=e.currentTarget,fd=new FormData(form),name=String(fd.get('name')||'').trim(),number=String(fd.get('number')||'').trim();
   if(!name)return alert('Projektname fehlt.');
   if(number&&state.projects.some(p=>p.number===number))return alert('Diese Projektnummer existiert bereits.');
   const p={id:id(),name,number,customerId:c.id,phase:typeof phases!=='undefined'?phases[0]:'Angebotsphase',notes:''};
   state.projects.push(p);save();
   try{await Promise.race([lgWaitForSavedProject(p.id),new Promise((_,reject)=>setTimeout(()=>reject(Error('Speicherung nach 15 Sekunden nicht bestätigt.')),15000))]);LGStudio.startInternal(p.id)}
   catch(err){alert('Projekt konnte nicht bestätigt werden: '+err.message+' – bitte in der Projektübersicht prüfen.')}
  };
 }
 async function lgWaitForSavedProject(pid){
  if(!cloudReady||lgBlocked)throw Error('Supabase nicht bereit.');
  while(lgBusy)await new Promise(r=>setTimeout(r,75));
  await lgFlush();
  while(lgBusy)await new Promise(r=>setTimeout(r,75));
  if(lgBlocked||!lgBaseline.projects[pid])throw Error('Projekt nicht in Supabase bestätigt.');
 }
 function startInternal(projectId){
  const c=cust(selectedCustomer),p=proj(projectId);
  if(!c||!p||p.customerId!==c.id)return alert('Projekt gehört nicht zum ausgewählten Kunden.');
  const d={id:id(),type:'Q',studio:true,number:'',approvalState:'draft',status:'Entwurf',customerId:c.id,projectId:p.id,date:today(),vat:Number(state.settings.vat??19),lines:[{id:id(),sku:'',description:'',qty:1,price:0,discount:0,percent:100}],studioTop:'<p><br></p>',studioBottom:'<p><br></p>',studioFreeTables:[],studioCalcHeadings:['Pos.','Leistungsbeschreibung','Menge','Einzelpreis netto','Rabatt %','Kosten'],notes:'',introText:'',outroText:'',deliveryTerm:'',serviceDate:'',payment:'Zahlbar sofort ohne Abzug'};
  state.docs.push(d);save();open(d.id);
 }
 function external(){
  const c=cust(selectedCustomer);if(!c)return alert('Kunde auswählen.');
  document.getElementById('app').innerHTML=`<section class="as-shell"><div class="as-head"><div><h2>Externes Angebot anlegen</h2><p class="muted">${escape(c.name)} · Stammdaten werden automatisch übernommen</p></div><button class="secondary" onclick="LGStudio.newQuote()">← Zurück</button></div>
  <div class="panel as-external-card"><h3>1 · Angebotsdaten erfassen</h3><p class="muted">Nach dem Anlegen wird die Angebotsnummer verbindlich aus dem Nummernkreis vergeben. Anschließend kannst du das PDF mit dieser Nummer erstellen und hochladen.</p>
  <form id="as-external"><div class="as-meta">
   <label>Angebotsdatum *<input name="date" type="date" value="${today()}" required></label>
   <label>Angebotsbezeichnung *<input name="title" maxlength="180" placeholder="z. B. Lichtkonzept Empfang" required></label>
   <label>Projekt / Referenz<input name="reference" maxlength="180" placeholder="Projektname / Projektnummer"></label>
   <label>Nettobetrag (€) *<input name="net" type="number" min="0" step=".01" required></label>
   <label>MwSt.-Satz (%) *<input name="vat" type="number" min="0" max="100" step=".01" value="${Number(state.settings.vat??19)}" required></label>
   <label>Bruttobetrag (€)<input id="as-gross-input" readonly></label>
   <label>Gültig bis<input name="validUntil" type="date"></label>
   <label>Voraussichtlicher Liefer-/Leistungszeitraum<input name="delivery" maxlength="180"></label>
   <label>Zahlungsbedingungen<input name="payment" maxlength="180" placeholder="z. B. 14 Tage netto"></label>
  </div><label>Interne Notizen / Bemerkungen<textarea name="notes" rows="3" placeholder="Optional"></textarea></label>
  <p class="as-message">* Pflichtfelder. Die Angebotsnummer wird im nächsten Schritt vergeben und kann danach nicht wiederverwendet werden.</p>
  <button type="submit">Angebotsnummer vergeben und fortfahren</button></form></div></section>`;
  const form=document.getElementById('as-external');
  form.oninput=()=>{const fd=new FormData(form);document.getElementById('as-gross-input').value=(Number(fd.get('net'))*(1+Number(fd.get('vat'))/100)).toFixed(2).replace('.',',')};
  form.oninput();
  form.onsubmit=async ev=>{
   ev.preventDefault();if(!form.reportValidity())return;
   const fd=new FormData(form),net=Number(fd.get('net')),vat=Number(fd.get('vat'));
   if(!Number.isFinite(net)||net<0||!Number.isFinite(vat)||vat<0||vat>100)return alert('Bitte Beträge prüfen.');
   if(!cloudReady||lgBlocked)return alert('Supabase ist nicht bereit.');
   const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Nummer wird vergeben …';
   const d={id:id(),type:'Q',studio:true,external:true,externalPendingPdf:true,number:'',approvalState:'draft',status:'Entwurf',customerId:c.id,projectId:'',date:String(fd.get('date')),vat,externalNet:net,externalGross:Math.round(net*(1+vat/100)*100)/100,externalTitle:String(fd.get('title')).trim(),externalReference:String(fd.get('reference')).trim(),externalValidUntil:String(fd.get('validUntil')),externalDelivery:String(fd.get('delivery')).trim(),payment:String(fd.get('payment')).trim(),notes:String(fd.get('notes')).trim(),lines:[{id:id(),description:'Externes Angebot – Gesamtbetrag',qty:1,price:net,discount:0,percent:100}]};
   state.docs.push(d);save();
   try{
    await Promise.race([lgWaitForSavedDoc(d.id),new Promise((_,reject)=>setTimeout(()=>reject(Error('Speicherung nach 15 Sekunden nicht bestätigt.')),15000))]);
    const {data:released,error}=await cloudClient.rpc('lg_release_document',{p_doc_id:d.id});
    if(error)throw Error('Nummernvergabe in Supabase abgelehnt: '+error.message);
    await lgLoad();
    const saved=doc(d.id),number=String(saved?.number||released?.number||'').trim();
    if(!number)throw Error('Keine Angebotsnummer bestätigt. Bitte die Übersicht prüfen.');
    if(saved&&!saved.number){saved.number=number;saved.approvalState='issued';save();await lgWaitForSavedDoc(d.id);}
    open(d.id);
   }catch(e){alert('Nummer konnte nicht vergeben werden: '+e.message);window.LGPlatform.open('Angebotsstudio')}
   finally{button.disabled=false;button.textContent='Angebotsnummer vergeben und fortfahren'}
  };
 }
 async function downloadExternal(did){const d=doc(did);if(!d?.externalPath)return;const {data,error}=await cloudClient.storage.from('lg-offers').download(d.externalPath);if(error)return alert(error.message);const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=d.externalFileName||'Angebot.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
 async function replaceExternal(did){const d=doc(did);if(!d?.external)return;const inp=document.createElement('input');inp.type='file';inp.accept='application/pdf';inp.onchange=async()=>{const file=inp.files?.[0];if(!file||file.size>15e6)return alert('Maximal 15 MB');const path=d.externalPath||`${d.id}.pdf`;const {error}=await cloudClient.storage.from('lg-offers').upload(path,file,{upsert:!!d.externalPath,contentType:'application/pdf'});if(error)return alert(error.message);d.externalPath=path;d.externalFileName=file.name;d.externalPendingPdf=false;save();try{await lgWaitForSavedDoc(d.id);open(d.id)}catch(e){alert('PDF hochgeladen, aber Dokumentdaten konnten nicht bestätigt werden: '+e.message)}};inp.click()}
 async function releaseExternal(did){const d=doc(did);if(!d?.external)return;open(did)}
 async function retryNumber(did){
  const d=doc(did);if(!d?.external)return;
  if(!d.lines?.length){d.lines=[{id:id(),description:'Externes Angebot – Gesamtbetrag',qty:1,price:Number(d.externalNet||0),discount:0,percent:100}];save();}
  if(d.number)return open(did);
  try{
   await Promise.race([lgWaitForSavedDoc(did),new Promise((_,r)=>setTimeout(()=>r(Error('Speicherung dauert zu lange')),15000))]);
   const {data,error}=await cloudClient.rpc('lg_release_document',{p_doc_id:did});
   if(error)throw error;
   await lgLoad();
   const x=doc(did),number=String(x?.number||data?.number||'').trim();
   if(!number)throw Error('Keine Nummer von der Datenbank bestätigt');
   if(x&&!x.number){x.number=number;x.approvalState='issued';save();await lgWaitForSavedDoc(did)}
   open(did);
  }catch(e){alert('Nummernvergabe fehlgeschlagen: '+e.message)}
 }
 function openExternal(d){
  const c=cust(d.customerId)||{},gross=Number(d.externalGross??(Number(d.externalNet)*(1+Number(d.vat)/100)));
  document.getElementById('app').innerHTML=`<section class="as-shell"><div class="as-head"><div><h2>Externes Angebot · ${escape(d.number||'Entwurf')}</h2><p class="muted">${escape(c.name)} · ${d.externalPendingPdf?'PDF noch nicht hinterlegt':'PDF hinterlegt'}</p></div><button class="secondary" onclick="LGStudio.back()">← Übersicht</button></div>
  <div class="panel as-external-card"><h3>${d.externalPendingPdf?'2 · Angebots-PDF hochladen':'Angebotsübersicht'}</h3>
  <p>Verbindliche Angebotsnummer:</p><div class="as-number">${escape(d.number||'Nummer ausstehend')}</div>${!d.number?`<button onclick="LGStudio.retryNumber('${d.id}')">Nummer erneut anfordern</button>`:''}
  <p class="as-message">Diese Nummer muss auf dem extern erstellten Angebot stehen. Anschließend die endgültige PDF-Datei hochladen.</p>
  <div class="as-meta"><div><b>Bezeichnung</b><p>${escape(d.externalTitle||'—')}</p></div><div><b>Projekt</b><p>${escape(d.externalReference||'—')}</p></div><div><b>Datum</b><p>${escape(d.date||'—')}</p></div><div><b>Netto</b><p>${eur(d.externalNet)}</p></div><div><b>MwSt.</b><p>${escape(d.vat)} %</p></div><div><b>Brutto</b><p>${eur(gross)}</p></div><div><b>Gültig bis</b><p>${escape(d.externalValidUntil||'—')}</p></div><div><b>Lieferung</b><p>${escape(d.externalDelivery||'—')}</p></div><div><b>Zahlung</b><p>${escape(d.payment||'—')}</p></div></div>
  <div class="as-actions"><button onclick="LGStudio.replaceExternal('${d.id}')">${d.externalPath?'PDF ersetzen':'PDF hochladen'}</button>${d.externalPath?`<button class="secondary" onclick="LGStudio.downloadExternal('${d.id}')">PDF herunterladen</button>`:''}
  ${d.externalPath?`<button class="secondary" onclick="LGStudio.manualDoc('${d.id}','C')">AB manuell erstellen</button><button class="secondary" onclick="LGStudio.manualDoc('${d.id}','I')">Rechnung manuell erstellen</button>`:''}</div>
  ${d.externalPath?`<p class="as-message">Gespeicherte Datei: ${escape(d.externalFileName||'PDF')}</p>`:'<p class="as-message">Noch kein PDF hochgeladen. Das Angebot bleibt in der Übersicht als unvollständig gekennzeichnet.</p>'}</div></section>`;
 }
 async function deleteDraft(did){
  const d=doc(did);if(!d||!isStudio(d)||locked(d))return alert('Nur nicht freigegebene Entwürfe können gelöscht werden.');
  if(state.docs.some(x=>x.sourceId===did||x.quoteId===did||x.orderId===did))return alert('Dieser Entwurf wird bereits von einem anderen Dokument referenziert.');
  if(!confirm('Diesen Entwurf endgültig löschen?'))return;
  const i=state.docs.findIndex(x=>x.id===did);if(i<0)return;
  state.docs.splice(i,1);save();
  try{await lgFlush();if(lgBlocked)throw Error('Supabase-Synchronisierung blockiert.');window.LGPlatform.open('Angebotsstudio')}
  catch(e){state.docs.splice(i,0,d);alert('Löschen nicht bestätigt: '+e.message)}
 }
 function manualDoc(did,type){const d=doc(did);if(!locked(d))return;const x={id:id(),type,number:'',approvalState:'draft',status:'Entwurf',customerId:d.customerId,date:today(),vat:d.vat,sourceId:d.id,lines:[{id:id(),description:'',qty:1,price:0,discount:0,percent:100}]};state.docs.push(x);save();window.LGPlatform.open(type==='I'?'Rechnungen & Gutschriften':'Auftragsbestätigungen');documentForm(x.id,type)}
 function calcHeaders(d,ro){
  const heads=d.studioCalcHeadings||['Pos.','Leistungsbeschreibung','Menge','Einzelpreis netto','Rabatt %','Kosten'];
  return heads.map((h,i)=>`<th ${i===0?'style="width:8%"':''}><span ${ro?'':'contenteditable="true"'} data-head="${i}">${escape(h)}</span></th>`).join('')+ '<th class="as-edit-only"></th>';
 }
 function freeTables(d,ro){
  return (d.studioFreeTables||[]).map((t,i)=>`<section class="as-free-block" data-free="${i}"><div class="as-free-controls as-edit-only">${ro?'':`<button onclick="LGStudio.freeRow(${i})">+ Zeile</button><button onclick="LGStudio.freeCol(${i})">+ Spalte</button><button onclick="LGStudio.freeRemove(${i})">Tabelle entfernen</button>`}</div><table class="as-free-table"><tbody>${(t.cells||[]).map((row,r)=>`<tr>${row.map((cell,c)=>`<${r===0?'th':'td'} contenteditable="${!ro}" data-r="${r}" data-c="${c}">${escape(cell)}</${r===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></section>`).join('');
 }
 function freeAdd(){const d=collect();d.studioFreeTables=d.studioFreeTables||[];d.studioFreeTables.push({cells:[['Spalte 1','Spalte 2'],['','']]});open(d.id);dirty=true}
 function freeRow(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;t.cells.push(Array(t.cells[0].length).fill(''));open(d.id);dirty=true}
 function freeCol(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;t.cells.forEach(r=>r.push(''));open(d.id);dirty=true}
 function freeRemove(i){if(!confirm('Freie Tabelle entfernen?'))return;const d=collect();d.studioFreeTables.splice(i,1);open(d.id);dirty=true}
 function lineRows(d,readonly){
  return (d.lines||[]).map((l,i)=>`<tr data-line="${i}"><td>${i+1}</td><td><input aria-label="Beschreibung" data-key="description" value="${escape(l.description)}" ${readonly?'disabled':''}></td><td><input aria-label="Menge" type="number" min="0" step="0.01" data-key="qty" value="${Number(l.qty||0)}" ${readonly?'disabled':''}></td><td><input aria-label="Einzelpreis" type="number" min="0" step="0.01" data-key="price" value="${Number(l.price||0)}" ${readonly?'disabled':''}></td><td><input aria-label="Rabatt" type="number" min="0" max="100" step="0.01" data-key="discount" value="${Number(l.discount||0)}" ${readonly?'disabled':''}></td><td>${eur(Number(l.qty||0)*Number(l.price||0)*(1-Number(l.discount||0)/100))}</td><td>${readonly?'':`<button class="danger" onclick="LGStudio.removeLine(${i})">×</button>`}</td></tr>`).join('');
 }
 function open(did){
  const d=doc(did);if(!isStudio(d))return alert('Angebotsstudio-Dokument nicht gefunden.');
  current=did;dirty=false;if(d.external){openExternal(d);return}const ro=locked(d),c=cust(d.customerId)||{};
  const app=document.getElementById('app');
  app.innerHTML=`<section class="as-shell"><div class="as-head"><div><h2>${d.type==='Q'?'Individuelles Angebot':'Auftragsbestätigung'} · ${escape(d.number||'Entwurf')}</h2><p class="muted">${escape(c.name||'Kunde')} · ${ro?'Freigegeben – schreibgeschützt':'Bearbeitbarer Entwurf'}</p></div><div class="as-actions"><button class="secondary" onclick="LGStudio.back()">← Übersicht</button><button class="secondary" onclick="LGStudio.exportPdf()">PDF herunterladen</button>${ro?'':`<button onclick="LGStudio.saveDraft()">Entwurf speichern</button><button onclick="LGStudio.release()">Freigeben</button>`}${ro&&d.type==='Q'?`<button onclick="LGStudio.order('${d.id}')">In Auftrag übernehmen</button>`:''}${ro?`<button onclick="LGStudio.invoice('${d.id}')">Rechnung erstellen</button>`:''}</div></div>
  <p class="as-message">Briefkopf, Kundenadresse und Fußbereich sind gesperrt. Zusätzliche Tabellen und Formatierungen können in den Textfeldern frei eingefügt werden. Die Positionstabelle bleibt für Rechnungen strukturiert.</p>
  <div class="as-meta"><div><label>Dokumentdatum</label><input id="as-date" type="date" value="${escape(d.date)}" ${ro?'disabled':''}></div><div><label>Mehrwertsteuer (%)</label><input id="as-vat" type="number" min="0" max="100" value="${Number(d.vat??19)}" ${ro?'disabled':''}></div><div><label>Dokumentnummer</label><input value="${escape(d.number||'Wird bei Freigabe vergeben')}" disabled></div></div>
  <div class="as-editor-layout"><div class="as-editor-document">
  <div id="as-paper" class="as-canvas"><div class="as-lock"><div class="as-address">${escape(c.name)}\n${escape(c.address||'Keine Rechnungsadresse hinterlegt')}</div><img alt="Die Lichtgestalter Logo" src="${LOGO}"></div>
  <h2>${d.type==='Q'?'Angebot':'Auftragsbestätigung'} Nr. ${escape(d.number||'Entwurf')}</h2><p><b>Projekt Nr. ${escape(proj(d.projectId)?.number||proj(d.projectId)?.projectNumber||'—')}</b></p><p style="text-align:right">Datum: ${escape(d.date)}</p>
  <div id="as-top" class="as-body" contenteditable="${!ro}" spellcheck="true">${cleanHtml(d.studioTop||initial())}</div>
  <h3>Positionen</h3><table class="as-position"><thead><tr>${calcHeaders(d,ro)}</tr></thead><tbody id="as-lines">${lineRows(d,ro)}</tbody></table>
  <div class="as-money">Netto: <span id="as-total">${eur(amount(d))}</span></div>
  <div id="as-free-tables">${freeTables(d,ro)}</div><div id="as-bottom" class="as-body" contenteditable="${!ro}" spellcheck="true">${cleanHtml(d.studioBottom||'<p><br></p>')}</div>
  <div class="as-protected">${escape(state.settings.company||'Die Lichtgestalter')}<br>${escape(state.settings.address||'')}<br>${escape(state.settings.email||'')}</div></div></div>
  ${!ro?`<div class="as-tools"><button onclick="LGStudio.format('bold')"><b>Fett</b></button><button onclick="LGStudio.format('italic')"><i>Kursiv</i></button><button onclick="LGStudio.format('underline')"><u>Unterstrichen</u></button><button onclick="LGStudio.format('insertUnorderedList')">Liste</button><button onclick="LGStudio.heading()">Überschrift</button><button onclick="LGStudio.table()">+ Zusatztabelle</button><button onclick="LGStudio.image()">+ Bild</button><button onclick="LGStudio.line()">+ Kalkulationsposition</button><button onclick="LGStudio.freeAdd()">+ Freie Tabelle</button></div>`:''}
</div></div></section>`;
  if(!ro){
   for(const e of app.querySelectorAll('#as-top,#as-bottom,#as-lines,#as-date,#as-vat,#as-free-tables,.as-position thead'))e.addEventListener('input',()=>{dirty=true;updateTotals()});
  }
 }
 function updateTotals(){
  let sum=0;document.querySelectorAll('#as-lines tr').forEach(tr=>{const v=k=>Number(tr.querySelector(`[data-key="${k}"]`)?.value||0);sum+=v('qty')*v('price')*(1-v('discount')/100);const cell=tr.children[5];if(cell)cell.textContent=eur(v('qty')*v('price')*(1-v('discount')/100))});
  const e=document.getElementById('as-total');if(e)e.textContent=eur(sum);
 }
 function collect(){
  const d=doc(current);if(!d||locked(d))throw Error('Dokument ist nicht bearbeitbar.');
  const lines=[...document.querySelectorAll('#as-lines tr')].map((tr,i)=>{const v=k=>tr.querySelector(`[data-key="${k}"]`)?.value;return {id:d.lines?.[i]?.id||id(),sku:'',description:v('description')||'',qty:Number(v('qty')),price:Number(v('price')),discount:Number(v('discount')),percent:100}});
  if(!lines.length)throw Error('Mindestens eine Position erforderlich.');
  if(lines.some(x=>!Number.isFinite(x.qty)||!Number.isFinite(x.price)||x.qty<0||x.price<0||x.discount<0||x.discount>100))throw Error('Mengen, Preise oder Rabatte sind ungültig.');
  const heads=[...document.querySelectorAll('[data-head]')].map(e=>e.textContent.trim());
  const free=[...document.querySelectorAll('[data-free]')].map(block=>({cells:[...block.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(cell=>cell.textContent))}));
  Object.assign(d,{studioCalcHeadings:heads,studioFreeTables:free,studioTop:cleanHtml(document.getElementById('as-top').innerHTML),studioBottom:cleanHtml(document.getElementById('as-bottom').innerHTML),date:document.getElementById('as-date').value,vat:Number(document.getElementById('as-vat').value),lines});
  return d;
 }
 async function saveDraft(){
  try{const d=collect();save();if(typeof lgFlush==='function')await lgFlush();if(typeof lgWaitForSavedDoc==='function')await lgWaitForSavedDoc(d.id);dirty=false;alert('Entwurf in Supabase gespeichert.');open(d.id)}
  catch(e){alert('Speichern fehlgeschlagen: '+e.message)}
 }
 async function release(){
  try{const d=collect();if(!confirm('Angebot verbindlich freigeben? Danach ist es schreibgeschützt.'))return;
   save();if(typeof lgFlush==='function')await lgFlush();await lgWaitForSavedDoc(d.id);
   const {data,error}=await cloudClient.rpc('lg_release_document',{p_doc_id:d.id});if(error)throw error;
   await lgLoad();dirty=false;open(d.id);alert('Freigegeben: '+(data?.number||doc(d.id)?.number||''));
  }catch(e){alert('Freigabe fehlgeschlagen: '+e.message)}
 }
 function back(){if(dirty&&!confirm('Nicht gespeicherte Änderungen verwerfen?'))return;current=null;window.LGPlatform.open('Angebotsstudio')}
 function format(cmd){document.execCommand(cmd,false,null)}
 function heading(){document.execCommand('formatBlock',false,'h3')}
 function activeEditor(){const sel=window.getSelection(),node=sel?.anchorNode;const e=node?.parentElement?.closest?.('#as-top,#as-bottom');return e||document.getElementById('as-bottom')}
 function table(){const e=activeEditor();e.focus();document.execCommand('insertHTML',false,'<table><tbody><tr><th>Spalte 1</th><th>Spalte 2</th></tr><tr><td>Text</td><td>Text</td></tr></tbody></table><p><br></p>');dirty=true}
 function image(){const url=prompt('Bild-URL (https://) eingeben:');if(!url)return;if(!/^https:\/\//i.test(url))return alert('Nur HTTPS-Bild-URLs sind erlaubt.');activeEditor().focus();document.execCommand('insertHTML',false,`<img src="${escape(url)}" alt="Angebotsbild" style="max-width:100%;height:auto">`);dirty=true}
 function line(){const d=collect();d.lines.push({id:id(),sku:'',description:'',qty:1,price:0,discount:0,percent:100});open(d.id);dirty=true}
 function removeLine(i){const d=collect();if(d.lines.length<2)return alert('Mindestens eine Position erforderlich.');d.lines.splice(i,1);open(d.id);dirty=true}
 async function order(did){
  const d=doc(did);if(!d||d.type!=='Q'||!locked(d))return alert('Zuerst Angebot freigeben.');
  if(!confirm('Auftragsbestätigung mit identischem Layout als Entwurf erstellen?'))return;
  const copy=structuredClone(d);Object.assign(copy,{id:id(),type:'C',number:'',approvalState:'draft',status:'Entwurf',sourceId:d.id,date:today(),lines:d.lines.map(l=>({...l,id:id()}))});delete copy.revisionRoot;delete copy.revisionLabel;
  state.docs.push(copy);save();open(copy.id);
 }
 async function invoice(did){
  const d=doc(did);if(!d||!locked(d))return alert('Zuerst Dokument freigeben.');
  if(!confirm('Normale Rechnung als Entwurf erstellen? Es werden ausschließlich die Positionen übernommen.'))return;
  const inv={id:id(),type:'I',number:'',approvalState:'draft',status:'Entwurf',customerId:d.customerId,projectId:d.projectId||'',date:today(),vat:d.vat,sourceId:d.id,quoteId:d.type==='Q'?d.id:'',orderId:d.type==='C'?d.id:'',invoiceKind:'Schlussrechnung',lines:d.lines.map(l=>({...l,id:id(),percent:100})),notes:'',introText:'',outroText:'',payment:'Zahlbar sofort ohne Abzug',deliveryTerm:'',serviceDate:''};
  state.docs.push(inv);save();window.LGPlatform.open('Rechnungen & Gutschriften');documentForm(inv.id,'I');
 }
 async function exportPdf(){
  if(!window.html2pdf)return alert('PDF-Bibliothek konnte nicht geladen werden.');
  const d=doc(current);if(!d)return;
  if(!locked(d)&&dirty){alert('Bitte zuerst den Entwurf speichern.');return}
  const source=document.getElementById('as-paper');const clone=source.cloneNode(true);
  clone.querySelectorAll('input').forEach(input=>{const t=document.createElement('span');t.textContent=input.value;input.replaceWith(t)});
  clone.querySelectorAll('button').forEach(b=>b.remove());
  clone.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
  clone.style.cssText='background:white;color:#111;width:190mm;max-width:190mm;min-height:auto;padding:12mm;font-family:Arial,sans-serif';
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;z-index:-1';host.appendChild(clone);document.body.appendChild(host);
  try{await html2pdf().set({margin:8,filename:(d.number||'Angebotsentwurf')+'.pdf',image:{type:'jpeg',quality:.97},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy']}}).from(clone).save()}
  catch(e){alert('PDF-Erstellung fehlgeschlagen: '+e.message)}finally{host.remove()}
 }
 return {page,retryNumber,newQuote,freeAdd,freeRow,freeCol,freeRemove,internal,external,deleteDraft,downloadExternal,replaceExternal,releaseExternal,manualDoc,open,saveDraft,release,back,format,heading,table,image,line,removeLine,order,invoice,exportPdf};
})();
