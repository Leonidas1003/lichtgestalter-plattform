/* V24: Download ohne Druck-/Vorschau-Dialog.
   Nutzt die vorhandene printDoc-Funktion nur zum Erzeugen des DOM.
   Keine Änderung an Daten oder Dokumenten. */
(function () {
  let busy = false;
  window.lgGeneratePdfBlob = async function (did) {
    if (busy) throw Error('PDF-Erstellung läuft bereits.');
    if (typeof html2pdf !== 'function') {
      throw Error('PDF-Bibliothek konnte nicht geladen werden.');
    }
    const d = typeof doc === 'function' ? doc(did) : null;
    if (!d) throw Error('Dokument nicht gefunden.');
    busy = true;
    const oldPrint = window.print;
    try {
      // printDoc erzeugt das Dokument, ohne den Druckdialog zu öffnen.
      window.print = function () {};
      printDoc(did);
      const paper = document.querySelector('#printarea .paper');
      if (!paper) throw new Error('Dokument konnte nicht aufgebaut werden.');
      const clone = paper.cloneNode(true);
      if(d.type==='Q'&&d.revisionLabel&&!d.number){const title=clone.querySelector('.doc-title > div');if(title)title.textContent='Angebot '+d.revisionLabel+' – ENTWURF';}
      // V28: finale PDF-Struktur bereinigen (auch alte gespeicherte Freitexte).
      // Bezugsnummer nur im Kopf, keine zweite Zeile unterhalb.
      const sourceNumber = d.sourceId && typeof doc === 'function' ? (doc(d.sourceId)?.number || '') : '';
      const title = clone.querySelector('.doc-title');
      if (title) {
        Array.from(title.children).forEach((el, index) => {
          if (index >= 2) el.remove();
        });
        if (sourceNumber) {
          const ref = document.createElement('div');
          ref.style.cssText = 'font-size:8pt;font-style:normal;font-weight:400';
          ref.textContent = 'Bezug: ' + sourceNumber;
          title.appendChild(ref);
        }
      }
      // Nur die Konten im Zahlungsabschnitt behalten.
      // Textknoten vor dem Zahlungshinweis filtern, unabhängig vom ursprünglichen Feld.
      const paymentMarker = 'Bitte überweisen Sie den Rechnungsbetrag';
      const textNodes = [];
      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      let paymentReached = false;
      for (const node of textNodes) {
        const value = node.nodeValue || '';
        if (value.includes(paymentMarker)) { paymentReached = true; continue; }
        if (paymentReached) continue;
        // Alle weiteren Referenzzeilen außer der neu erzeugten Bezug-Zeile entfernen.
        if (/^\s*(?:Auftragsbestätigung|Angebot|Lieferschein|Rechnung)\s*:\s*[QICD][_.-]\s*\d{4}/i.test(value)) {
          node.nodeValue = ''; continue;
        }
        if (d.type === 'I' && /(?:FYRST|Sparkasse\s+Bensheim|IBAN|BIC)/i.test(value)) {
          node.nodeValue = value.split(/\r?\n/).filter(line =>
            !/(?:FYRST|Sparkasse\s+Bensheim|IBAN|BIC)/i.test(line)
          ).join('\n');
        }
      }
      // Überflüssige Leerzeilen und <br>-Reste in den Freitextblöcken entfernen.
      for (const el of clone.querySelectorAll('.document-notes')) {
        if (!el.textContent.trim()) el.remove();
      }

      // V95: Rabattspalte nur bei tatsächlichem Positionsrabatt (Angebote).
      if (d.type === 'Q' && !(d.lines || []).some(l => Number(l.discount || 0) !== 0)) {
        const table = clone.querySelector('.document-table');
        if (table) {
          const idx = [...table.querySelectorAll('thead th')].findIndex(th => th.textContent.trim() === 'Rabatt');
          if (idx >= 0) {
            const cols = [...table.querySelectorAll('colgroup col')];
            if (cols[2] && cols[idx]) cols[2].style.width = (parseFloat(cols[2].style.width) + parseFloat(cols[idx].style.width)) + '%';
            cols[idx]?.remove();
            for (const row of table.rows) if (row.cells[idx]) row.deleteCell(idx);
          }
        }
      }
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;background:white;z-index:-1';
      clone.style.cssText = 'position:relative;width:210mm;min-height:282mm;box-sizing:border-box;padding:34mm 55mm 23mm 19mm;font:9.2pt/1.28 Arial,Helvetica,sans-serif;color:#111;background:#fff';
      const css = document.createElement('style');
      css.textContent = `
        .doc-logo{position:absolute;right:12mm;top:12mm;width:57mm;height:17mm;object-fit:contain}
        .sender{font-size:5.8pt;font-style:italic;margin-bottom:3mm}
        .recipient{white-space:pre-line;min-height:31mm;line-height:1.7}
        .doc-date{text-align:right;margin:1mm 0 10mm;white-space:nowrap}
        .doc-title{font-weight:800;font-style:italic;font-size:10pt;line-height:1.7}
        .intro{margin:12mm 0 5mm}.service{margin:2mm 0}
        .document-table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:7.5pt!important}
        .document-table th{font-size:6.5pt!important;background:#dce2e8!important;color:#111!important;padding:3px!important}
        .document-table td{vertical-align:top;padding:10px 3px!important;border:0!important;overflow-wrap:anywhere;color:#111!important}
        .document-table th *, .document-table td *{color:#111!important;opacity:1!important}
        .document-table .num{text-align:right;white-space:nowrap}
        .totals{margin:10mm 0 0 23%;border-top:1px solid #999;padding-top:4mm;font-size:8.5pt}
        .totals>div{display:flex;justify-content:space-between;gap:10px;padding:2mm 0}
        .totals .grand{border-top:2px solid #111;margin-top:1mm;font-weight:700}
        .document-notes{margin-top:13mm;font-size:9pt;line-height:1.5}
        .delivery-signature{margin-top:18mm;font-size:8.5pt;break-inside:avoid;page-break-inside:avoid}.delivery-signature-line{display:flex;gap:16mm;margin-top:19mm}.delivery-signature-line span{flex:1;border-top:1px solid #333;padding-top:2mm;font-size:7.5pt}.company-side{position:absolute;right:8mm;bottom:19mm;width:39mm;text-align:right;font-size:6.3pt;line-height:1.65;color:#777}
        .page-number{position:absolute;bottom:10mm;left:50%;font-size:6.5pt;color:#555}
      `;
      host.append(css,clone);
      document.body.appendChild(host);
      try {
        const img = clone.querySelector('.doc-logo');
        if (img && !img.complete) await new Promise(resolve => {img.onload=resolve;img.onerror=resolve;});
        if (['Q','C','I','G','D'].includes(d.type)) {
          // Build physical A4 pages before rasterization, rather than slicing one long canvas.
          const logo = clone.querySelector('.doc-logo');
          const company = clone.querySelector('.company-side');
          const content = [...clone.children].filter(el => !el.matches('.doc-logo,.company-side,.page-number'));
          const pages = [];
          let page, body;
          function newPage() {
            page = document.createElement('div');
            page.className = 'paper lg-paged-offer';
            page.style.cssText = 'position:relative;width:210mm;height:297mm;min-height:0;box-sizing:border-box;padding:34mm 55mm 23mm 19mm;font:9.2pt/1.28 Arial,Helvetica,sans-serif;color:#111;background:white;overflow:hidden;margin:0;box-shadow:none';
            if (logo) page.append(logo.cloneNode(true));
            body = document.createElement('div');
            body.style.cssText = 'height:240mm;display:flow-root;box-sizing:border-box;';
            page.append(body);
            if (company) {const footer=company.cloneNode(true);footer.style.setProperty('position','absolute','important');page.append(footer);}
            const number = document.createElement('div'); number.className='page-number'; number.textContent='Seite '+(pages.length+1); number.style.transform='translateX(-50%)'; page.append(number);
            host.append(page); pages.push(page);
          }
          function fits() { return body.scrollHeight <= body.clientHeight + 1; }
          function place(el) {
            body.append(el);
            if (fits()) return;
            el.remove();
            if (body.children.length) newPage();
            body.append(el);
            if (!fits()) throw Error('Ein Dokumentblock ist höher als eine A4-Seite. Bitte kürzen oder aufteilen.');
          }
          function notes(el) {
            // Split at explicit line and paragraph boundaries, retaining inline markup.
            const pieces=[]; let part=el.cloneNode(false);
            for (const node of [...el.childNodes]) {
              if (node.nodeName==='BR') { pieces.push(part); part=el.cloneNode(false); }
              else if (node.nodeName==='P') { if(part.childNodes.length) pieces.push(part); const p=el.cloneNode(false); p.append(node.cloneNode(true)); pieces.push(p); part=el.cloneNode(false); }
              else part.append(node.cloneNode(true));
            }
            if(part.childNodes.length) pieces.push(part);
            let group=el.cloneNode(false); body.append(group);
            for(const piece of pieces) {
              const line=document.createElement('div'); line.style.minHeight='1.5em'; line.append(...piece.childNodes); group.append(line);
              if(!fits()) { line.remove(); if(!group.childNodes.length) group.remove(); newPage(); group=el.cloneNode(false); group.style.marginTop='0'; body.append(group); group.append(line); if(!fits()) throw Error('Ein Textabsatz ist höher als eine A4-Seite.'); }
            }
          }
          newPage();
          for (const el of content) {
            if (el.matches('.document-table')) {
              let table;
              function startTable() { table=el.cloneNode(false); for(const child of el.children) if(child.tagName!=='TBODY') table.append(child.cloneNode(true)); table.append(document.createElement('tbody')); body.append(table); }
              startTable();
              for(const row of el.querySelectorAll('tbody tr')) {
                const copy=row.cloneNode(true); table.tBodies[0].append(copy);
                if(!fits()) { copy.remove(); if(!table.tBodies[0].rows.length) table.remove(); newPage(); startTable(); table.tBodies[0].append(copy); if(!fits()) throw Error('Eine Dokumentposition ist höher als eine A4-Seite. Bitte auf mehrere Positionen verteilen.'); }
              }
            } else if(el.matches('.document-notes')) notes(el);
            else if(el.matches('.totals') && el.scrollHeight > body.clientHeight) {for(const child of el.children){const part=el.cloneNode(false);part.style.marginTop='2mm';part.append(child.cloneNode(true));place(part);}} else place(el.cloneNode(true));
          }
          clone.remove();
          let pdf;
          for(const sheet of pages) {
            const worker=html2pdf().set({margin:0,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',scrollX:0,scrollY:0},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:[]}}).from(sheet).toCanvas();
            const canvas=await worker.get('canvas');
            if(!pdf) { pdf=await worker.toPdf().get('pdf'); while(pdf.getNumberOfPages()>1) pdf.deletePage(pdf.getNumberOfPages()); }
            else { pdf.addPage('a4','portrait'); pdf.addImage(canvas.toDataURL('image/jpeg',0.98),'JPEG',0,0,210,297); }
          }
          return pdf.output('blob');
        }
        const pdfBlob = await html2pdf().set({
          margin:0,
          filename:(d.number || 'Dokument').replace(/[^a-zA-Z0-9_.-]/g,'_')+'.pdf',
          image:{type:'jpeg',quality:0.98},
          html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',scrollX:0,scrollY:0},
          jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
          pagebreak:{mode:['legacy']}
        }).from(clone).outputPdf('blob');
        return pdfBlob;
      } finally {host.remove();}
    } catch (e) {
      throw e;
    } finally {
      window.print = oldPrint;
      busy = false;
    }
  };
  window.downloadDoc = async function(did){
    try{
      const blob=await window.lgGeneratePdfBlob(did);
      const d=doc(did),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=(d?.number||'Entwurf').replace(/[^a-zA-Z0-9_.-]/g,'_')+'.pdf';
      document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(e){alert('PDF-Download fehlgeschlagen: '+e.message)}
  };
})();
