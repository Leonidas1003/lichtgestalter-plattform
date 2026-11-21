/* Angebotsstudio V55 – runs inside the existing authenticated app.
   Data: existing state.docs / lg_records, no new database tables. */
const LGStudio=(()=>{
 'use strict';
 let current=null, dirty=false;
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
 #app .as-tools{display:flex;gap:5px;flex-wrap:wrap;padding:10px;background:#e9eef5;border-radius:10px;margin:16px 0}#app .as-tools button{padding:7px 10px;font-size:13px}
 #app .as-protected{margin-top:38px;text-align:right;font-size:11px;color:#5b6573;border-top:1px solid #ddd;padding-top:16px}
 #app .as-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0}#app .as-meta label{font-size:12px}
 #app .as-meta input,#app .as-meta select{width:100%}#app .as-list{width:100%}#app .as-list td{padding:13px}
 #app .as-message{font-size:13px;color:#5a6472;margin-top:10px}#app .as-money{text-align:right;margin-top:12px;font-weight:bold}
 @media(max-width:700px){#app .as-canvas{padding:20px;min-height:650px}#app .as-meta{grid-template-columns:1fr}#app .as-lock img{max-width:100px}}
 @media print{#app .as-tools,#app .as-actions,#app .as-meta,#app .as-message{display:none!important}}
 </style>`;
 function page(){
  if(!document.getElementById('lg-studio-style'))document.head.insertAdjacentHTML('beforeend',css);
  const rows=list().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return `<section class="as-shell"><div class="as-head"><div><h2>Angebotsstudio</h2><p class="muted">Individuelle Angebote gestalten – mit geschütztem Briefkopf und strukturierten Rechnungspositionen.</p></div><button onclick="LGStudio.newQuote()">+ Individuelles Angebot</button></div>
  <div class="panel tablewrap"><table class="as-list"><thead><tr><th>Dokument</th><th>Kunde</th><th>Datum</th><th>Status</th><th>Netto</th><th>Aktionen</th></tr></thead><tbody>
  ${rows.map(d=>`<tr><td>${escape(d.number||'Entwurf')} · ${d.type==='Q'?'Angebot':'Auftragsbestätigung'}</td><td>${escape(cust(d.customerId)?.name||'—')}</td><td>${escape(d.date)}</td><td>${locked(d)?'Freigegeben':'Entwurf'}</td><td>${eur(amount(d))}</td><td><button class="secondary" onclick="LGStudio.open('${d.id}')">${locked(d)?'Ansehen':'Bearbeiten'}</button> ${d.type==='Q'&&locked(d)?`<button class="secondary" onclick="LGStudio.order('${d.id}')">In Auftrag</button>`:''} ${locked(d)?`<button class="secondary" onclick="LGStudio.invoice('${d.id}')">Rechnung erstellen</button>`:''}</td></tr>`).join('')}
  </tbody></table>${rows.length?'':'<div class="empty">Noch keine individuellen Angebote vorhanden.</div>'}</div></section>`;
 }
 function newQuote(){
  const choices=state.customers.map((c,i)=>`${i+1}: ${c.name}`).join('\n');
  if(!state.customers.length)return alert('Bitte zuerst unter „Kundendaten“ einen Kunden anlegen.');
  const choice=prompt('Kunden auswählen (Nummer eingeben):\n'+choices);
  if(choice===null)return;
  const c=state.customers[Number(choice)-1];
  if(!c)return alert('Bitte eine gültige Kundennummer aus der Liste wählen.');
  const d={id:id(),type:'Q',studio:true,number:'',approvalState:'draft',status:'Entwurf',customerId:c.id,projectId:'',date:today(),vat:Number(state.settings.vat??19),lines:[{id:id(),sku:'',description:'Neue Position',qty:1,price:0,discount:0,percent:100}],studioTop:initial(),studioBottom:'<p>Wir freuen uns auf die Zusammenarbeit.</p>',notes:'',introText:'',outroText:'',deliveryTerm:'',serviceDate:'',payment:'Zahlbar sofort ohne Abzug'};
  state.docs.push(d);save();open(d.id);
 }
 function lineRows(d,readonly){
  return (d.lines||[]).map((l,i)=>`<tr data-line="${i}"><td>${i+1}</td><td><input aria-label="Beschreibung" data-key="description" value="${escape(l.description)}" ${readonly?'disabled':''}></td><td><input aria-label="Menge" type="number" min="0" step="0.01" data-key="qty" value="${Number(l.qty||0)}" ${readonly?'disabled':''}></td><td><input aria-label="Einzelpreis" type="number" min="0" step="0.01" data-key="price" value="${Number(l.price||0)}" ${readonly?'disabled':''}></td><td><input aria-label="Rabatt" type="number" min="0" max="100" step="0.01" data-key="discount" value="${Number(l.discount||0)}" ${readonly?'disabled':''}></td><td>${eur(Number(l.qty||0)*Number(l.price||0)*(1-Number(l.discount||0)/100))}</td><td>${readonly?'':`<button class="danger" onclick="LGStudio.removeLine(${i})">×</button>`}</td></tr>`).join('');
 }
 function open(did){
  const d=doc(did);if(!isStudio(d))return alert('Angebotsstudio-Dokument nicht gefunden.');
  current=did;dirty=false;const ro=locked(d),c=cust(d.customerId)||{};
  const app=document.getElementById('app');
  app.innerHTML=`<section class="as-shell"><div class="as-head"><div><h2>${d.type==='Q'?'Individuelles Angebot':'Auftragsbestätigung'} · ${escape(d.number||'Entwurf')}</h2><p class="muted">${escape(c.name||'Kunde')} · ${ro?'Freigegeben – schreibgeschützt':'Bearbeitbarer Entwurf'}</p></div><div class="as-actions"><button class="secondary" onclick="LGStudio.back()">← Übersicht</button><button class="secondary" onclick="LGStudio.exportPdf()">PDF herunterladen</button>${ro?'':`<button onclick="LGStudio.saveDraft()">Entwurf speichern</button><button onclick="LGStudio.release()">Freigeben</button>`}${ro&&d.type==='Q'?`<button onclick="LGStudio.order('${d.id}')">In Auftrag übernehmen</button>`:''}${ro?`<button onclick="LGStudio.invoice('${d.id}')">Rechnung erstellen</button>`:''}</div></div>
  <p class="as-message">Briefkopf, Kundenadresse und Fußbereich sind gesperrt. Zusätzliche Tabellen und Formatierungen können in den Textfeldern frei eingefügt werden. Die Positionstabelle bleibt für Rechnungen strukturiert.</p>
  <div class="as-meta"><div><label>Dokumentdatum</label><input id="as-date" type="date" value="${escape(d.date)}" ${ro?'disabled':''}></div><div><label>Mehrwertsteuer (%)</label><input id="as-vat" type="number" min="0" max="100" value="${Number(d.vat??19)}" ${ro?'disabled':''}></div><div><label>Dokumentnummer</label><input value="${escape(d.number||'Wird bei Freigabe vergeben')}" disabled></div></div>
  ${!ro?`<div class="as-tools"><button onclick="LGStudio.format('bold')"><b>Fett</b></button><button onclick="LGStudio.format('italic')"><i>Kursiv</i></button><button onclick="LGStudio.format('underline')"><u>Unterstrichen</u></button><button onclick="LGStudio.format('insertUnorderedList')">Liste</button><button onclick="LGStudio.heading()">Überschrift</button><button onclick="LGStudio.table()">+ Zusatztabelle</button><button onclick="LGStudio.image()">+ Bild</button><button onclick="LGStudio.line()">+ Position</button></div>`:''}
  <div id="as-paper" class="as-canvas"><div class="as-lock"><div class="as-address">${escape(c.name)}\n${escape(c.address||'Keine Rechnungsadresse hinterlegt')}</div><img alt="Die Lichtgestalter Logo" src="${LOGO}"></div>
  <h2>${d.type==='Q'?'Angebot':'Auftragsbestätigung'}</h2><p>Datum: ${escape(d.date)}</p>
  <div id="as-top" class="as-body" contenteditable="${!ro}" spellcheck="true">${cleanHtml(d.studioTop||initial())}</div>
  <h3>Positionen</h3><table class="as-position"><thead><tr><th>Pos.</th><th>Beschreibung</th><th>Menge</th><th>Einzelpreis netto</th><th>Rabatt %</th><th>Gesamt netto</th><th></th></tr></thead><tbody id="as-lines">${lineRows(d,ro)}</tbody></table>
  <div class="as-money">Netto: <span id="as-total">${eur(amount(d))}</span></div>
  <div id="as-bottom" class="as-body" contenteditable="${!ro}" spellcheck="true">${cleanHtml(d.studioBottom||'<p><br></p>')}</div>
  <div class="as-protected">${escape(state.settings.company||'Die Lichtgestalter')}<br>${escape(state.settings.address||'')}<br>${escape(state.settings.email||'')}</div></div></section>`;
  if(!ro){
   for(const e of app.querySelectorAll('#as-top,#as-bottom,#as-lines,#as-date,#as-vat'))e.addEventListener('input',()=>{dirty=true;updateTotals()});
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
  Object.assign(d,{studioTop:cleanHtml(document.getElementById('as-top').innerHTML),studioBottom:cleanHtml(document.getElementById('as-bottom').innerHTML),date:document.getElementById('as-date').value,vat:Number(document.getElementById('as-vat').value),lines});
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
 return {page,newQuote,open,saveDraft,release,back,format,heading,table,image,line,removeLine,order,invoice,exportPdf};
})();
