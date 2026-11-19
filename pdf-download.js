/* V24: Download ohne Druck-/Vorschau-Dialog.
   Nutzt die vorhandene printDoc-Funktion nur zum Erzeugen des DOM.
   Keine Änderung an Daten oder Dokumenten. */
(function () {
  let busy = false;
  window.downloadDoc = async function (did) {
    if (busy) return;
    if (typeof html2pdf !== 'function') {
      alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden.');
      return;
    }
    const d = typeof doc === 'function' ? doc(did) : null;
    if (!d) return alert('Dokument nicht gefunden.');
    busy = true;
    const oldPrint = window.print;
    try {
      // printDoc erzeugt das Dokument, ohne den Druckdialog zu öffnen.
      window.print = function () {};
      printDoc(did);
      const paper = document.querySelector('#printarea .paper');
      if (!paper) throw new Error('Dokument konnte nicht aufgebaut werden.');
      const clone = paper.cloneNode(true);
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
        await html2pdf().set({
          margin:0,
          filename:(d.number || 'Dokument').replace(/[^a-zA-Z0-9_.-]/g,'_')+'.pdf',
          image:{type:'jpeg',quality:0.98},
          html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',scrollX:0,scrollY:0},
          jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
          pagebreak:{mode:['legacy']}
        }).from(clone).save();
      } finally {host.remove();}
    } catch (e) {
      alert('PDF-Download fehlgeschlagen: '+(e.message || e));
    } finally {
      window.print = oldPrint;
      busy = false;
    }
  };
})();
