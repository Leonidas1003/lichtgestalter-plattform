/* Angebotsstudio V55 – runs inside the existing authenticated app.
   Data: existing state.docs / lg_records, no new database tables. */
const LGStudio=(()=>{
 'use strict';
 let current=null, dirty=false, selectedCustomer=null, selectedElement=null, selectedCell=null, selectedCells=new Set(), pendingNewOffer=null, selectedBlocks=new Set(), historyPast=[], historyFuture=[], historyDoc=null, historyRestoring=false;
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

 const facsimilePages=[[{"x":56.7,"y":334.1,"w":119.0,"h":16.3,"text":"Projekt Nr. 026.2601","size":11.0,"bold":true},{"x":56.7,"y":352.3,"w":359.5,"h":16.3,"text":"Vergabeverfahren - Planungsleistungen für die Beleuchtung des","size":11.0,"bold":true},{"x":56.7,"y":370.5,"w":368.7,"h":16.3,"text":"Schulradwegs entlang der K67 zwischen Zwingenberg und Rodau","size":11.0,"bold":true},{"x":56.7,"y":388.8,"w":258.7,"h":16.2,"text":"Ihr Zeichen: 1211-2610-Schulwegbeleuchtung K67-PL","size":11.0,"bold":false},{"x":56.7,"y":430.8,"w":297.3,"h":16.2,"text":"Wir freuen uns über Ihre Anfrage und bieten Ihnen wie folgt an:","size":11.0,"bold":false},{"x":56.7,"y":458.8,"w":411.2,"h":128.2,"text":"Das Honorar für die Planung einer autarken Solarbeleuchtung entlang eines 1,5 km \nlangen Schulradwegs orientiert sich in der Praxis meist an den Leistungsphasen (LPH) der \nHOAI (Leistungsbild Technische Ausrüstung – Starkstromanlagen, § 53 ff.) sowie den \nergänzenden Leistungsbildern Lichtplanung (Außen- und Straßenbeleuchtung) der \nDeutschen Lichttechnischen Gesellschaft (LiTG). \nDa Solarleuchten als autarke Inselanlagen ohne Erdverkabelung funktionieren und \nselbstständige Radwege oft frei vereinbart werden, verschieben sich die Schwerpunkte im \nHonorar stark von der klassischen Tiefbau-/Kabelnetzplanung hin zur lichttechnischen, \nenergetischen und umweltfachlichen Dimensionierung.","size":11.0,"bold":false},{"x":56.7,"y":598.8,"w":357.1,"h":30.2,"text":"Folgende Grundleistungen bieten wir gemäß der Leistungsbeschreibung vom \n10.10.2026, Ihr Zeichen: 1211-2610-Schulwegbeleuchtung K67-PL an:","size":11.0,"bold":false},{"x":76.4,"y":648.3,"w":380.7,"h":11.0,"text":"Leistungsphase (LPH)\nSpezifische Leistungsbestandteile für die Solar-Radwegbeleuchtung","size":8.0,"bold":true},{"x":59.0,"y":718.3,"w":115.6,"h":11.0,"text":"LPH 1: Grundlagenermittlung","size":8.0,"bold":true},{"x":182.5,"y":663.3,"w":271.1,"h":12.0,"text":"• Begehung der 1,5 km langen Trasse (Bestandsaufnahme, Baumbestand,","size":8.0,"bold":false},{"x":182.5,"y":673.3,"w":257.7,"h":22.0,"text":"Topografie)\n• Prüfung vorhandener Unterlagen und Ermittlung zusätzlich benötigter","size":8.0,"bold":false},{"x":182.5,"y":693.3,"w":246.2,"h":22.0,"text":"Grundlagen\n• Klärung planerischer Randbedingungen, insbesondereHinsichtlich","size":8.0,"bold":false},{"x":182.5,"y":713.3,"w":271.0,"h":32.0,"text":"Flächenverfügbarkeit, vorhandener Starkstromleitungen, Straßenverkehr, \nBrückenbauwerk und Natur- und Artenschutz\n• Klärung der Nutzungszeiten (Schulwegzeiten morgens/nachmittags,","size":8.0,"bold":false},{"x":182.5,"y":743.3,"w":280.4,"h":32.0,"text":"Nachtabsenkung)\n• Abstimmung der Beleuchtungsklasse nach DIN EN 13201 mit der Kommune\n• Abstimmung weiterer Planungsgrundlagen mit der Stadt und den","size":8.0,"bold":false},{"x":188.5,"y":773.3,"w":73.8,"h":11.0,"text":"zuständigen Stellen","size":8.0,"bold":false},{"x":246.5,"y":792.2,"w":37.0,"h":10.2,"text":"Seite  von \n1\n4","size":6.0,"bold":false},{"x":56.7,"y":131.9,"w":242.5,"h":10.2,"text":"Die Lichtgestalter • Ges. für Licht + Raum mbH - Adam-Höfle-Weg 11 - 64673 Zwingenberg","size":6.0,"bold":true}],[{"x":59.0,"y":229.9,"w":75.4,"h":11.0,"text":"LPH 2: Vorplanung","size":8.0,"bold":true},{"x":182.5,"y":129.9,"w":226.6,"h":12.0,"text":"• Entwicklung eines technisch geeigneten und wirtschaftlichen","size":8.0,"bold":false},{"x":182.5,"y":139.9,"w":240.8,"h":22.0,"text":"Beleuchtungskonzepts\n• Systemauswahl (Masttyp, integrierte vs. aufgesetzte PV-Module,","size":8.0,"bold":false},{"x":182.5,"y":159.9,"w":280.8,"h":22.1,"text":"Batterietechnologie)\n• Grobe Festlegung der Mastabstände (ca. 25–35 m → ca. 45–60 Masten auf","size":8.0,"bold":false},{"x":182.5,"y":180.1,"w":238.6,"h":22.0,"text":"1,5 km)\n• Festlegung und Begründung der maßgeblichen lichttechnischen","size":8.0,"bold":false},{"x":182.5,"y":200.1,"w":277.3,"h":22.0,"text":"Anforderungen sowie Erstellung einer lichttechnischen Berechnung\n• Prüfung und nachvollziehbare Darlegung der Eignung der Solarversorgung","size":8.0,"bold":false},{"x":182.5,"y":220.1,"w":275.1,"h":32.0,"text":"und Speicherkapazität unter Berücksichtigung des Winterbetriebs und der \nörtlichen Verschattung\n• Darstellung einer bedarfsgerechten Steuerung unter Berücksichtigung von","size":8.0,"bold":false},{"x":182.5,"y":250.1,"w":228.4,"h":22.0,"text":"Betriebszeiten, Dimmung und Bewegungserfassung/Sensorik\n• Berücksichtigung einer möglichst geringen Blendwirkung und","size":8.0,"bold":false},{"x":182.5,"y":270.1,"w":272.0,"h":42.0,"text":"Lichtabstrahlung in angrenzende Flächen und den Straßenverkehr, sowie \nBelange des Natur-und Artenschutzes\n• Erste Kostenschätzung (nach DIN 276), Terminplanung\n• Gegenüberstellung der Investitions- und Betriebskosten einschließlich","size":8.0,"bold":false},{"x":182.5,"y":310.1,"w":269.7,"h":22.0,"text":"Wartung und voraussichtlichem Austausch von Komponenten\n• Vorbereitung der erforderlichen Abstimmungen mit Straßenbaulastträger,","size":8.0,"bold":false},{"x":188.5,"y":330.1,"w":172.6,"h":11.0,"text":"Hessen Mobil und weiteren zuständigen Stellen","size":8.0,"bold":false},{"x":59.0,"y":405.4,"w":96.9,"h":11.0,"text":"LPH 3: Entwurfsplanung","size":8.0,"bold":true},{"x":182.5,"y":340.4,"w":270.6,"h":12.0,"text":"• Ausarbeitung des abgestimmten Beleuchtungskonzepts mit Lageplan mit","size":8.0,"bold":false},{"x":182.5,"y":350.4,"w":263.1,"h":22.0,"text":"exakten Maststandorten und technischen Anforderungen\n• Planung der Aufstellung und Gründung der Leuchten einschließlich der","size":8.0,"bold":false},{"x":182.5,"y":370.4,"w":251.9,"h":32.0,"text":"erforderlichen Schnittstellen zu Tiefbauarbeiten\n• Festlegen aller Systeme und Anlagenteile\n• Lichttechnische Berechnung (Beleuchtungsstärke, Gleichmäßigkeit,","size":8.0,"bold":false},{"x":182.5,"y":400.4,"w":261.3,"h":22.0,"text":"Blendfreiheit)\n• Solare Ertrags- und Autarkieberechnung (Auslegung für Wintermonate/","size":8.0,"bold":false},{"x":182.5,"y":420.4,"w":260.0,"h":22.0,"text":"Schlechtwettertage)\n• Berechnen und Bemessen der technischen Anlagen und Anlagenteile,","size":8.0,"bold":false},{"x":182.5,"y":440.4,"w":283.1,"h":32.0,"text":"Abschätzen von jährlichen Bedarfswerten und Betriebskosten\n• Kostenberechnung Nach DIN 276 und Fortschreibung der Terminplanung\n• Vorabstimmung mit Behörden und mit anderen zu beteiligenden Stellen über","size":8.0,"bold":false},{"x":188.5,"y":470.4,"w":101.0,"h":11.0,"text":"die Genehmigungsfähigkeit","size":8.0,"bold":false},{"x":59.0,"y":510.8,"w":120.9,"h":11.0,"text":"LPH 4: Genehmigungsplanung","size":8.0,"bold":true},{"x":182.5,"y":480.8,"w":280.7,"h":12.0,"text":"• Erarbeiten und Zusammenstellen der Vorlagen und Nachweise für öffentlich-","size":8.0,"bold":false},{"x":182.5,"y":490.8,"w":275.1,"h":52.0,"text":"rechtliche Genehmigungen oder Zustimmungen einschließlich der Anträge \nauf Ausnahmen oder Befreiungen sowie Mitwirken bei Verhandlungen mit \nBehörden\n• Behördenabstimmung: Klärung von Fragen zum Naturschutz und Baurecht\n• Vervollständigen und Anpassen der Planungsunterlagen, Beschreibungen","size":8.0,"bold":false},{"x":188.5,"y":540.8,"w":71.6,"h":11.0,"text":"und Berechnungen","size":8.0,"bold":false},{"x":59.0,"y":626.1,"w":112.1,"h":11.0,"text":"LPH 5: Ausführungsplanung","size":8.0,"bold":true},{"x":182.5,"y":551.1,"w":255.5,"h":12.0,"text":"• Erstellung der für die Ausführung erforderlichen Planungsunterlagen,","size":8.0,"bold":false},{"x":182.5,"y":561.1,"w":280.0,"h":42.0,"text":"insbesondere konkrete Standort- und Detailpläne, technische \nDimensionierungen und eindeutig beschriebene Schnittstellen zu Gründung \nund Tiefbau\n• Abstimmen der Ausführungszeichnungen mit dem Objektplaner und den","size":8.0,"bold":false},{"x":182.5,"y":601.1,"w":215.9,"h":32.0,"text":"übrigen Fachplanern\n• Fortschreibung des Terminplans\n• Fortschreiben der Ausführungsplanung auf den Stand der","size":8.0,"bold":false},{"x":182.5,"y":631.1,"w":282.1,"h":42.0,"text":"Ausschreibungsergebnisse und der dann vorliegenden Ausführungsplanung \ndes Objektplaners, Übergeben der fortgeschriebenen Ausführungsplanung \nan die ausführenden Unternehmen\n• Prüfen und Anerkennen der Montage- und Werkstattpläne der ausführenden","size":8.0,"bold":false},{"x":182.5,"y":671.1,"w":234.1,"h":22.0,"text":"Unternehmen auf Übereinstimmung mit der Ausführungsplanun\n• Festlegung der Dimm- und Sensorik-Profile (z. B. Radar-/PIR-","size":8.0,"bold":false},{"x":182.5,"y":691.1,"w":225.7,"h":22.0,"text":"Bewegungsmelder, mitlaufendes Licht)\n• Exakte Ausrichtung der PV-Module (Neigungswinkel, Azimut)","size":8.0,"bold":false},{"x":246.5,"y":792.2,"w":37.0,"h":10.2,"text":"Seite  von \n2\n4","size":6.0,"bold":false}],[{"x":56.7,"y":464.0,"w":392.3,"h":30.2,"text":"Zahlungsbedingung: sofort rein netto nach Rechnungseingang, Abrechnung nach zu \nvereinbarendem Zahlungsplan","size":11.0,"bold":false},{"x":56.7,"y":747.9,"w":265.6,"h":30.2,"text":"Dieses Angebot ist 2 Wochen bindend und freibleibend.  \nEs gelten unsere Allgemeinen Geschäftsbedingungen.","size":11.0,"bold":false},{"x":70.1,"y":132.9,"w":363.5,"h":9.0,"text":"Pos.\nLeistungsbeschreibung\nFaktor\nKosten","size":6.0,"bold":true},{"x":99.7,"y":150.0,"w":362.4,"h":32.5,"text":"Basishonorar Zone II über alle Leistungsphasen (100%) in Anlehnung an die HOAI 2021 abzgl. \nWiederholungsfaktor zzgl. besonderer Anforderungen durch Verschiedenartigkeit des \nGeländes und Umfeldanforderungen","size":8.0,"bold":true},{"x":99.7,"y":194.0,"w":47.8,"h":11.0,"text":"46.850,00 €","size":8.0,"bold":true},{"x":74.1,"y":216.0,"w":393.5,"h":11.0,"text":"1\nLPH 1 - Bestandsaufnahme und Grundlagenklärung\n2 %\n937,00 €","size":8.0,"bold":false},{"x":74.1,"y":241.5,"w":393.5,"h":11.0,"text":"2\nLPH 2 - Vorplanung\n9 %\n4.216,50 €","size":8.0,"bold":false},{"x":74.1,"y":267.0,"w":393.5,"h":11.0,"text":"3\nLPH 3 - Entwurfsplanung\n17 %\n7.964,50 €","size":8.0,"bold":false},{"x":74.1,"y":292.5,"w":393.5,"h":11.0,"text":"4\nLPH 4 - Genehmigungsplanung\n2 %\n937,00 €","size":8.0,"bold":false},{"x":74.1,"y":318.0,"w":393.5,"h":11.0,"text":"5\nLPH 5 - Ausführungsplanung\n22 %\n10.307,00 €","size":8.0,"bold":false},{"x":99.7,"y":357.9,"w":365.8,"h":13.0,"text":"SUMME NETTO\n24.362,00 €","size":10.0,"bold":true},{"x":99.7,"y":377.9,"w":365.8,"h":12.0,"text":"zzgl. Nebenkosten \n4 %\n974,48 €","size":8.0,"bold":false},{"x":99.7,"y":398.1,"w":365.8,"h":11.0,"text":"zzgl. MwSt.\n19 %\n4.813,93 €","size":8.0,"bold":false},{"x":99.7,"y":420.2,"w":365.8,"h":13.0,"text":"GESAMTBETRAG\n30.150,41 €","size":10.0,"bold":true},{"x":56.9,"y":514.0,"w":333.5,"h":16.2,"text":"Grundlage für Zusatzkosten: Besondere Leistungen außerhalb der HOAI","size":11.0,"bold":false},{"x":396.4,"y":539.0,"w":56.0,"h":12.6,"text":"Pauschale netto","size":8.0,"bold":false},{"x":58.9,"y":560.0,"w":199.3,"h":12.6,"text":"LPh 1 Standortanalyse (inklusive Verschattungsberechnung)","size":8.0,"bold":false},{"x":434.8,"y":567.0,"w":36.3,"h":12.6,"text":"785,00 €","size":8.0,"bold":false},{"x":58.9,"y":585.6,"w":122.2,"h":12.6,"text":"LPh 2 Lichttechnische Visualisierung","size":8.0,"bold":false},{"x":434.8,"y":592.6,"w":36.3,"h":12.6,"text":"925,00 €","size":8.0,"bold":false},{"x":60.9,"y":612.3,"w":410.2,"h":18.6,"text":"LPh 2 Lichttechnische Visualisierung jede weitere\n785,00 €","size":8.0,"bold":false},{"x":58.9,"y":636.9,"w":184.4,"h":12.6,"text":"LPh 3 Lichttechnische Simulation (Streulicht, Blendung)","size":8.0,"bold":false},{"x":434.8,"y":643.9,"w":36.3,"h":12.6,"text":"785,00 €","size":8.0,"bold":false},{"x":58.9,"y":662.6,"w":229.4,"h":12.6,"text":"LPh 3 Bemusterung jeweils (exklusive evtl. anfallender Musterkosten)","size":8.0,"bold":false},{"x":434.8,"y":669.6,"w":36.3,"h":12.6,"text":"575,00 €","size":8.0,"bold":false},{"x":58.9,"y":688.2,"w":121.9,"h":12.6,"text":"LPh 3 Anpassen einer Serienleuchte","size":8.0,"bold":false},{"x":434.8,"y":695.2,"w":36.3,"h":12.6,"text":"575,00 €","size":8.0,"bold":false},{"x":58.9,"y":713.8,"w":113.4,"h":12.6,"text":"LPh 3 Entwicklung Sonderleuchte","size":8.0,"bold":false},{"x":427.9,"y":720.8,"w":43.2,"h":12.6,"text":"1.375,00 €","size":8.0,"bold":false},{"x":246.5,"y":792.2,"w":37.0,"h":10.2,"text":"Seite  von \n3\n4","size":6.0,"bold":false}],[{"x":56.7,"y":142.4,"w":174.7,"h":16.2,"text":"Zusatzbestimmungen/Erläuterungen:","size":11.0,"bold":false},{"x":56.7,"y":170.4,"w":415.9,"h":16.2,"text":"Allen ermittelten Kosten und weiteren Beauftragungen legen wir folgende Sätze zugrunde:","size":11.0,"bold":false},{"x":56.7,"y":198.4,"w":299.6,"h":44.2,"text":"Tagessatz Büro (Mischsatz)\t\n€ 785,00 \nTagessatz LichtplanerIn/LichtgestalterIn\t\t\n€ 925,00 \nTagessatz MitarbeiterIn\t\t\n€ 695,00","size":11.0,"bold":false},{"x":56.7,"y":254.4,"w":299.6,"h":30.2,"text":"Stundensatz LichtplanerIn/LichtgestalterIn\t\n€ 117,50 \nStundensatz MitarbeiterIn\t\n€   77,50","size":11.0,"bold":false},{"x":56.7,"y":296.4,"w":299.6,"h":16.2,"text":"Fahrtkosten PKW pro km (auf Nachweis)\t\n€     0,85","size":11.0,"bold":false},{"x":56.7,"y":324.4,"w":419.0,"h":44.2,"text":"Reisekosten Zug, bzw. Flug werden auf Basis Economy-Class, bzw. 2. Klasse auf Nachweis \nabgerechnet. Spesen werden pauschal gem. gültiger Spesensätze oder als Aufwand auf \nNachweis abgerechnet.","size":11.0,"bold":false},{"x":246.5,"y":792.2,"w":37.0,"h":10.2,"text":"Seite  von \n4\n4","size":6.0,"bold":false}]];
 function templateInit(){return {studioFacsimile:true,studioFacsimilePages:JSON.parse(JSON.stringify(facsimilePages)),studioTemplateTables:JSON.parse(JSON.stringify([{"page": 1, "x": 57, "y": 642, "w": 416, "kind": "lph", "headers": ["Leistungsphase (LPH)", "Spezifische Leistungsbestandteile für die Solar-Radwegbeleuchtung"], "rows": [["LPH 1: Grundlagenermittlung", "• Begehung der 1,5 km langen Trasse (Bestandsaufnahme, Baumbestand, Gesellschaft für Licht + Raum mbH Topografie)\n• Prüfung vorhandener Unterlagen und Ermittlung zusätzlich benötigter Adam-Höfle-Weg 11 Grundlagen 64673 Zwingenberg\n• Klärung planerischer Randbedingungen, insbesondereHinsichtlich T +49.6251.84808.0 Flächenverfügbarkeit, vorhandener Starkstromleitungen, Straßenverkehr, F +49.6251.8480818 Brückenbauwerk und Natur- und Artenschutz\n• Klärung der Nutzungszeiten (Schulwegzeiten morgens/nachmittags, contact@dielichtgestalter.de Nachtabsenkung)\n• Abstimmung der Beleuchtungsklasse nach DIN EN 13201 mit der Kommune Geschäftsführer:\n• Abstimmung weiterer Planungsgrundlagen mit der Stadt und den Christoph Adlfinger-Pullmann zuständigen Stellen"]], "widths": [30, 70], "rowHeight": 144}, {"page": 2, "x": 57, "y": 123, "w": 416, "kind": "lph", "headers": [], "rows": [["LPH 2: Vorplanung", "• Entwicklung eines technisch geeigneten und wirtschaftlichen Beleuchtungskonzepts\n• Systemauswahl (Masttyp, integrierte vs. aufgesetzte PV-Module, Batterietechnologie)\n• Grobe Festlegung der Mastabstände (ca. 25–35 m → ca. 45–60 Masten auf 1,5 km)\n• Festlegung und Begründung der maßgeblichen lichttechnischen Anforderungen sowie Erstellung einer lichttechnischen Berechnung\n• Prüfung und nachvollziehbare Darlegung der Eignung der Solarversorgung und Speicherkapazität unter Berücksichtigung des Winterbetriebs und der örtlichen Verschattung\n• Darstellung einer bedarfsgerechten Steuerung unter Berücksichtigung von Betriebszeiten, Dimmung und Bewegungserfassung/Sensorik\n• Berücksichtigung einer möglichst geringen Blendwirkung und Lichtabstrahlung in angrenzende Flächen und den Straßenverkehr, sowie Belange des Natur-und Artenschutzes\n• Erste Kostenschätzung (nach DIN 276), Terminplanung\n• Gegenüberstellung der Investitions- und Betriebskosten einschließlich Wartung und voraussichtlichem Austausch von Komponenten\n• Vorbereitung der erforderlichen Abstimmungen mit Straßenbaulastträger, Hessen Mobil und weiteren zuständigen Stellen"], ["LPH 3: Entwurfsplanung", "• Ausarbeitung des abgestimmten Beleuchtungskonzepts mit Lageplan mit exakten Maststandorten und technischen Anforderungen\n• Planung der Aufstellung und Gründung der Leuchten einschließlich der erforderlichen Schnittstellen zu Tiefbauarbeiten\n• Festlegen aller Systeme und Anlagenteile\n• Lichttechnische Berechnung (Beleuchtungsstärke, Gleichmäßigkeit, Blendfreiheit)\n• Solare Ertrags- und Autarkieberechnung (Auslegung für Wintermonate/ Schlechtwettertage)\n• Berechnen und Bemessen der technischen Anlagen und Anlagenteile, Abschätzen von jährlichen Bedarfswerten und Betriebskosten\n• Kostenberechnung Nach DIN 276 und Fortschreibung der Terminplanung\n• Vorabstimmung mit Behörden und mit anderen zu beteiligenden Stellen über die Genehmigungsfähigkeit"], ["LPH 4: Genehmigungsplanung", "• Erarbeiten und Zusammenstellen der Vorlagen und Nachweise für öffentlich- rechtliche Genehmigungen oder Zustimmungen einschließlich der Anträge auf Ausnahmen oder Befreiungen sowie Mitwirken bei Verhandlungen mit Behörden\n• Behördenabstimmung: Klärung von Fragen zum Naturschutz und Baurecht\n• Vervollständigen und Anpassen der Planungsunterlagen, Beschreibungen und Berechnungen"], ["LPH 5: Ausführungsplanung", "• Erstellung der für die Ausführung erforderlichen Planungsunterlagen, insbesondere konkrete Standort- und Detailpläne, technische Dimensionierungen und eindeutig beschriebene Schnittstellen zu Gründung und Tiefbau\n• Abstimmen der Ausführungszeichnungen mit dem Objektplaner und den übrigen Fachplanern\n• Fortschreibung des Terminplans\n• Fortschreiben der Ausführungsplanung auf den Stand der Ausschreibungsergebnisse und der dann vorliegenden Ausführungsplanung des Objektplaners, Übergeben der fortgeschriebenen Ausführungsplanung an die ausführenden Unternehmen\n• Prüfen und Anerkennen der Montage- und Werkstattpläne der ausführenden Unternehmen auf Übereinstimmung mit der Ausführungsplanun\n• Festlegung der Dimm- und Sensorik-Profile (z. B. Radar-/PIR- Bewegungsmelder, mitlaufendes Licht)\n• Exakte Ausrichtung der PV-Module (Neigungswinkel, Azimut)"]], "widths": [30, 70]}, {"page": 3, "x": 57, "y": 129, "w": 416, "kind": "calc", "headers": ["Pos.", "Leistungsbeschreibung", "Faktor", "Kosten"], "widths": [8, 63, 12, 17], "base": 46850, "extraPercent": 4, "vat": 19, "rows": [["", "Basishonorar Zone II über alle Leistungsphasen (100%) in Anlehnung an die HOAI 2021 abzgl. Wiederholungsfaktor zzgl. besonderer Anforderungen durch Verschiedenartigkeit des Geländes und Umfeldanforderungen", "", ""], ["", "46.850,00 €", "", ""], ["1", "LPH 1 - Bestandsaufnahme und Grundlagenklärung", "2 %", "937,00 €"], ["2", "LPH 2 - Vorplanung", "9 %", "4.216,50 €"], ["3", "LPH 3 - Entwurfsplanung", "17 %", "7.964,50 €"], ["4", "LPH 4 - Genehmigungsplanung", "2 %", "937,00 €"], ["5", "LPH 5 - Ausführungsplanung", "22 %", "10.307,00 €"], ["", "SUMME NETTO", "", "24.362,00 €"], ["", "zzgl. Nebenkosten", "4 %", "974,48 €"], ["", "zzgl. MwSt.", "19 %", "4.813,93 €"], ["", "GESAMTBETRAG", "", "30.150,41 €"]]}, {"page": 3, "x": 57, "y": 533, "w": 416, "kind": "extra", "headers": ["", "Pauschale netto"], "widths": [78, 22], "rows": [["LPh 1 Standortanalyse (inklusive Verschattungsberechnung)", "785,00 €"], ["LPh 2 Lichttechnische Visualisierung", "925,00 €"], ["LPh 2 Lichttechnische Visualisierung jede weitere", "785,00 €"], ["LPh 3 Lichttechnische Simulation (Streulicht, Blendung)", "785,00 €"], ["LPh 3 Bemusterung jeweils (exklusive evtl. anfallender Musterkosten)", "575,00 €"], ["LPh 3 Anpassen einer Serienleuchte", "575,00 €"], ["LPh 3 Entwicklung Sonderleuchte", "1.375,00 €"]]}, {"page": 4, "x": 57, "y": 196, "w": 416, "kind": "rates", "headers": [], "widths": [65, 35], "rows": [["Tagessatz Büro (Mischsatz)", "785,00 €"], ["Tagessatz LichtplanerIn/LichtgestalterIn", "925,00 €"], ["Tagessatz MitarbeiterIn", "695,00 €"], ["Stundensatz LichtplanerIn/LichtgestalterIn", "117,50 €"], ["Stundensatz MitarbeiterIn", "77,50 €"], ["Fahrtkosten PKW pro km (auf Nachweis)", "0,85 €"]]}]))};}
 const formatGermanDate=v=>{try{return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date((v||today())+'T12:00:00'))}catch(_){return v}};
 function facsimile(d,ro){const c=cust(d.customerId)||{},p=proj(d.projectId)||{},pages=d.studioFacsimilePages||facsimilePages;
  return `<div id="as-facsimile">${pages.map((blocks,pi)=>`<div class="as-facsimile-page" data-page="${pi}">
  <img class="as-facsimile-logo" src="${LOGO}" alt="Die Lichtgestalter">
  ${pi===0?`<div class="as-facsimile-sender">Die Lichtgestalter • Ges. für Licht + Raum mbH - Adam-Höfle-Weg 11 - 64673 Zwingenberg</div><div class="as-facsimile-customer">${escape(c.name||'')}<br>${escape(c.address||'').replace(/\n/g,'<br>')}</div><div class="as-facsimile-date">${escape(formatGermanDate(d.date))}</div><div class="as-facsimile-number"><b>Angebot Nr. ${escape(d.number||'Entwurf')}</b></div>`:''}
  ${blocks.map((b,i)=>{const tableArea=(pi===0&&b.y>=642)||(pi===1&&b.y>=120&&b.y<=715)||(pi===2&&((b.y>=128&&b.y<=432)||(b.y>=535&&b.y<=737)))||(pi===3&&b.y>=195&&b.y<=315);if(tableArea)return '';return `<div class="as-facsimile-block" data-block="${i}" contenteditable="${!ro}" style="left:${b.x/595.2756*100}%;top:${b.y/841.8898*100}%;width:${Math.min(100-b.x/595.2756*100,b.w/595.2756*100+2)}%;height:${(b.h||20)/841.8898*100}%;font-size:${b.size}pt;font-weight:${b.bold?700:400};${b.flow===false?'':''}" data-flow="${b.flow===false?'off':'on'}">${b.html?cleanHtml(b.html):escape(b.text).replace(/\n/g,'<br>')}</div>`}).join('')}
  ${pi===0?`<div class="as-facsimile-company">Die Lichtgestalter<br>Gesellschaft für Licht + Raum mbH<br><br>Adam-Höfle-Weg 11<br>64673 Zwingenberg<br>T +49.6251.84808.0<br>F +49.6251.8480818<br><br>contact@dielichtgestalter.de<br><br>Geschäftsführer:<br>Christoph Adlfinger-Pullmann<br><br>Registerblatt HRB 95326<br>Registergericht Darmstadt<br>USt-IdNr. DE305886656</div>`:''}
  ${(d.studioTemplateTables||[]).map((t,i)=>t.page===pi+1?`<div class="as-template-table as-table-${t.kind||'free'}" data-template-table="${i}" data-flow="${t.flow===false?'off':'on'}" style="left:${t.x/595.2756*100}%;top:${t.y/841.8898*100}%;width:${t.w/595.2756*100}%;${t.h?`height:${t.h/841.8898*100}%;`:``}"><div class="as-template-controls as-edit-only">${ro?'':`<button onclick="LGStudio.facsimileTableRow(${i})">+ Zeile</button><button onclick="LGStudio.facsimileTableCol(${i})">+ Spalte</button><button onclick="LGStudio.facsimileTableWidth(${i})">Breiten</button><button onclick="LGStudio.facsimileTableCalc(${i})">Berechnen</button><button onclick="LGStudio.facsimileTableDelete(${i})">Entfernen</button>`}</div><table><colgroup>${(t.widths||t.headers.map(()=>100/t.headers.length)).map(w=>`<col style="width:${Number(w)}%">`).join('')}</colgroup>${t.headers.length?`<thead><tr>${t.headers.map((h,j)=>`<th contenteditable="${!ro}" data-th="${j}" style="background:${escape(t.headerColors?.[j]||'#bcbcbc')}!important;color:${escape(t.headerTextColors?.[j]||'#111111')}!important;">${escape(h)}</th>`).join('')}</tr></thead>`:''}<tbody>${t.rows.map((r,ri)=>`<tr>${r.map((v,j)=>`<td contenteditable="${!ro}" data-tr="${ri}" data-td="${j}" style="background:${escape(t.cellColors?.[ri+','+j]||'#ffffff')}!important;color:${escape(t.cellTextColors?.[ri+','+j]||'#111111')}!important;">${escape(v).replace(/\n/g,'<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'').join('')}
  <div class="as-facsimile-footer">Seite ${pi+1} von ${pages.length}</div></div>`).join('')}</div>`;
 }
 function collectFacsimile(){const d=doc(current);if(!d||locked(d))throw Error('Dokument gesperrt');
  d.studioFacsimilePages=[...document.querySelectorAll('.as-facsimile-page')].map((page,pi)=>{const original=[...((d.studioFacsimilePages||facsimilePages)[pi]||[])];page.querySelectorAll('[data-block]').forEach(el=>{const i=Number(el.dataset.block);if(original[i])original[i]={...original[i],text:[...el.childNodes].filter(n=>!n.classList?.contains('as-drag-handle')&&!n.classList?.contains('as-resize-grip')).map(n=>n.textContent||'').join(''),html:[...el.childNodes].filter(n=>!n.classList?.contains('as-drag-handle')&&!n.classList?.contains('as-resize-grip')).map(n=>n.nodeType===1?n.outerHTML:n.textContent).join(''),x:parseFloat(el.style.left)*595.2756/100,y:parseFloat(el.style.top)*841.8898/100,w:parseFloat(el.style.width)*595.2756/100,h:parseFloat(el.style.height)*841.8898/100,flow:el.dataset.flow!=='off'}});return original});
  d.studioTemplateTables=(d.studioTemplateTables||[]).map((t,i)=>{const el=document.querySelector(`[data-template-table="${i}"]`);if(!el)return t;return {...t,headers:[...el.querySelectorAll('[data-th]')].map(e=>e.innerText),rows:[...el.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.innerText)),x:parseFloat(el.style.left)*595.2756/100,y:parseFloat(el.style.top)*841.8898/100,w:parseFloat(el.style.width)*595.2756/100,h:el.style.height?parseFloat(el.style.height)*841.8898/100:undefined,flow:el.dataset.flow!=='off',headerColors:[...el.querySelectorAll('thead th')].map(e=>e.style.backgroundColor||'#bcbcbc'),headerTextColors:[...el.querySelectorAll('thead th')].map(e=>e.style.color||'#111111'),cellColors:Object.fromEntries([...el.querySelectorAll('tbody td')].map(e=>[e.dataset.tr+','+e.dataset.td,e.style.backgroundColor||'#ffffff'])),cellTextColors:Object.fromEntries([...el.querySelectorAll('tbody td')].map(e=>[e.dataset.tr+','+e.dataset.td,e.style.color||'#111111']))}});d.date=document.getElementById('as-date')?.value||d.date;return d;
 }
 function facsimileTableAdd(){facsimileCheckpoint();const d=collectFacsimile();const n=Number(prompt('Tabelle auf Seite (1–'+d.studioFacsimilePages.length+')','4'));if(!Number.isInteger(n)||n<1||n>d.studioFacsimilePages.length)return;d.studioTemplateTables=d.studioTemplateTables||[];d.studioTemplateTables.push({page:n,x:57,y:400,w:416,kind:'free',widths:[50,50],headers:['Spalte 1','Spalte 2'],rows:[['','']]});open(d.id);dirty=true}
 function facsimileTableRow(i){facsimileCheckpoint();const d=collectFacsimile(),t=d.studioTemplateTables[i];if(!t)return;t.rows.push(t.headers.map(()=>'').slice());open(d.id);dirty=true}
 function facsimileTableCol(i){facsimileCheckpoint();const d=collectFacsimile(),t=d.studioTemplateTables[i];if(!t)return;t.headers.push('Neue Spalte');t.rows.forEach(r=>r.push(''));open(d.id);dirty=true}
 function facsimileTableDelete(i){if(!confirm('Tabelle entfernen?'))return;const d=collectFacsimile();d.studioTemplateTables.splice(i,1);open(d.id);dirty=true}
 function facsimileTableWidth(i){const d=collectFacsimile(),t=d.studioTemplateTables[i];if(!t)return;const n=t.rows[0]?.length||t.headers.length;const val=prompt('Spaltenbreiten in Prozent, z.B. 30,70',(t.widths||Array(n).fill(100/n)).join(','));if(val===null)return;const widths=val.split(',').map(v=>Number(v.trim().replace(',','.')));if(widths.length!==n||widths.some(w=>!Number.isFinite(w)||w<=0)||Math.abs(widths.reduce((a,b)=>a+b,0)-100)>.05)return alert('Breiten müssen zusammen 100 % ergeben.');t.widths=widths;open(d.id);dirty=true}
 function facsimileTableCalc(i){const d=collectFacsimile(),t=d.studioTemplateTables[i];if(!t)return;const col=Number(prompt('Ergebnisspalte (1-basiert)',''+t.rows[0].length))-1;if(!Number.isInteger(col)||col<0||col>=t.rows[0].length)return;const f=prompt('Formel: SUMME, PRODUKT oder PROZENT (Beispiel: 46850 * 9%)','SUMME');if(!f)return;const val=x=>Number(String(x).replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',','.'))||0;let result;if(f.toUpperCase()==='SUMME')result=t.rows.reduce((sum,row)=>sum+val(row[col]),0);else if(f.toUpperCase()==='PRODUKT'){const r=Number(prompt('Zeile (1-basiert)','1'))-1;const a=Number(prompt('Erste Faktor-Spalte','1'))-1,b=Number(prompt('Zweite Faktor-Spalte','2'))-1;if(!t.rows[r]||a<0||b<0)return;result=val(t.rows[r][a])*val(t.rows[r][b]);}else if(f.includes('*')){const [a,b]=f.split('*');result=val(a)*val(b)/(b.includes('%')?100:1);}else return alert('Unbekannte Formel');const r=Number(prompt('Ergebnis in Zeile (1-basiert)',''+t.rows.length))-1;if(!t.rows[r])return;t.rows[r][col]=new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(result)+' €';open(d.id);dirty=true}
 function facsimileFormat(cmd){const el=document.activeElement;if(!el?.isContentEditable)return alert('Zuerst Text markieren.');document.execCommand(cmd,false,null);dirty=true}
 function facsimileFont(sizeValue){
  const size=Number(sizeValue);if(!Number.isFinite(size)||size<5||size>96)return alert('Schriftgröße zwischen 5 und 96 pt eingeben.');
  const sel=window.getSelection(),range=sel?.rangeCount?sel.getRangeAt(0):null;
  const target=range?.commonAncestorContainer?.parentElement?.closest?.('[data-block],td,th')||selectedElement;
  if(!target||!target.closest('#as-facsimile'))return alert('Bitte zuerst Text oder ein Textfeld auswählen.');
  if(range&&!range.collapsed&&target.contains(range.commonAncestorContainer)){
    const span=document.createElement('span');span.style.fontSize=size+'pt';
    try{range.surroundContents(span)}catch(e){const frag=range.extractContents();span.append(frag);range.insertNode(span)}
  }else target.style.fontSize=size+'pt';
  dirty=true;
 }
 function facsimileSelect(el,additive=false){if(el?.matches('[data-block]')){if(!additive){selectedBlocks.forEach(x=>x.classList.remove('as-multi-selected'));selectedBlocks.clear()}selectedBlocks.add(el);selectedBlocks.forEach(x=>x.classList.add('as-multi-selected'))}else if(!additive){selectedBlocks.forEach(x=>x.classList.remove('as-multi-selected'));selectedBlocks.clear()}if(!additive){for(const c of selectedCells)c.classList.remove('as-cell-multi');selectedCells.clear()}if(selectedElement)selectedElement.classList.remove('as-selected');if(el.matches('td,th')){selectedCell=el;selectedElement=el.closest('[data-template-table]');selectedCells.add(el);el.classList.add('as-cell-multi')}else{selectedElement=el;selectedCell=null}selectedElement?.classList.add('as-selected');document.getElementById('as-flow-status')?.replaceChildren(document.createTextNode(selectedElement?.dataset.flow==='off'?'Aus':'An'))}
 function facsimileSnapshot(){
  const d=doc(current);if(!d?.studioFacsimile)return null;
  collectFacsimile();
  return JSON.stringify({pages:d.studioFacsimilePages,tables:d.studioTemplateTables,date:d.date});
 }
 function facsimileCheckpoint(){
  if(historyRestoring||!current)return;
  const snap=facsimileSnapshot();if(!snap)return;
  if(historyDoc!==current){historyPast=[];historyFuture=[];historyDoc=current}
  if(historyPast.at(-1)!==snap){historyPast.push(snap);if(historyPast.length>60)historyPast.shift()}
  historyFuture=[];dirty=true;
 }
 function facsimileRestore(snap){
  if(!snap)return;const d=doc(current);if(!d)return;
  const v=JSON.parse(snap);historyRestoring=true;
  d.studioFacsimilePages=v.pages;d.studioTemplateTables=v.tables;d.date=v.date;
  selectedElement=null;selectedBlocks.clear();selectedCells.clear();
  open(d.id);historyRestoring=false;dirty=true;
 }
 function facsimileUndo(){
  if(!historyPast.length)return;
  const now=facsimileSnapshot(),prior=historyPast.pop();
  if(now!==prior)historyFuture.push(now);
  facsimileRestore(prior);
 }
 function facsimileRedo(){
  if(!historyFuture.length)return;
  const now=facsimileSnapshot();historyPast.push(now);
  facsimileRestore(historyFuture.pop());
 }
 function facsimileDeleteSelected(){
  const targets=[...selectedBlocks].filter(e=>e.isConnected&&e.matches('[data-block]'));
  if(!targets.length&&selectedElement?.matches('[data-block]'))targets.push(selectedElement);
  if(!targets.length)return alert('Bitte Textfelder auswählen (Cmd/Strg + Klick für Mehrfachauswahl).');
  facsimileCheckpoint();
  const d=collectFacsimile();
  const grouped=new Map();
  for(const el of targets){
    const pi=Number(el.closest('[data-page]')?.dataset.page),idx=Number(el.dataset.block);
    if(!grouped.has(pi))grouped.set(pi,new Set());grouped.get(pi).add(idx);
  }
  for(const [pi,indices] of grouped)d.studioFacsimilePages[pi]=d.studioFacsimilePages[pi].filter((_,i)=>!indices.has(i));
  for(const page of d.studioFacsimilePages)for(const block of page)block.flow=false;
  for(const t of d.studioTemplateTables||[])t.flow=false;
  selectedBlocks.clear();selectedElement=null;
  // Do not modify other blocks' positions when a block is deleted.
  open(d.id);dirty=true;
 }
 function facsimileKeyboard(e){
  if(!document.getElementById('as-facsimile')||!current)return;
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?facsimileRedo():facsimileUndo();return}
  if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();facsimileRedo();return}
  if((e.key==='Delete'||e.key==='Backspace')&&!e.target.closest('[contenteditable="true"],input,textarea,select')){
    if(selectedBlocks.size||selectedElement?.matches('[data-block]')){e.preventDefault();facsimileDeleteSelected()}
  }
 }
 function facsimileDeleteBlock(){facsimileDeleteSelected()}
 function facsimileMove(direction){
  const el=selectedElement?.closest?.('[data-block],[data-template-table]')||selectedElement;if(!el)return alert('Element auswählen.');
  const page=el.closest('[data-page]');const all=[...page.querySelectorAll('[data-block],[data-template-table]')].sort((a,b)=>a.offsetTop-b.offsetTop);
  const idx=all.indexOf(el),other=all[idx+(direction==='up'?-1:1)];if(!other)return;
  const a=el.style.top,b=other.style.top;el.style.top=b;other.style.top=a;
  el.dataset.baseTop=String(el.offsetTop);other.dataset.baseTop=String(other.offsetTop);
  dirty=true;facsimileLayout(page);
 }
 function facsimileFlow(){const el=selectedElement;if(!el?.matches('[data-block],[data-template-table]'))return alert('Bitte Textfeld oder Tabelle auswählen.');el.dataset.flow=el.dataset.flow==='off'?'on':'off';dirty=true;facsimileLayout(el.closest('[data-page]'));const status=document.getElementById('as-flow-status');if(status)status.textContent=el.dataset.flow==='on'?'An':'Aus'}
 function facsimileCellColors(kind){
  const el=selectedCell?.isConnected?selectedCell:document.activeElement?.closest?.('td,th');
  if(!el)return alert('Bitte zuerst eine Tabellenzelle auswählen.');
  const picker=document.getElementById(kind==='bg'?'as-cell-bg-picker':'as-cell-text-picker');
  if(!picker)return;
  picker.value=rgbToHex(getComputedStyle(el)[kind==='bg'?'backgroundColor':'color']);
  picker.click();
 }
 function rgbToHex(value){const m=String(value).match(/\d+/g);return m?.length>=3?'#'+m.slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join(''):'#ffffff'}
 function facsimileApplyCellColor(kind,value){const el=selectedCell?.isConnected?selectedCell:null;if(!el)return alert('Bitte Tabellenzelle auswählen.');for(const cell of selectedCells.size?selectedCells:[el]){if(cell.isConnected){
    cell.style.setProperty(kind==='bg'?'background-color':'color',value,'important');
    if(kind==='text')cell.querySelectorAll('span,font,p,div').forEach(n=>n.style.setProperty('color',value,'important'));
  }}dirty=true}
 // A4 safe text area: 9.6% left, 9% right, 9% top, 10% bottom.
 function facsimileBounds(page){const w=page.clientWidth,h=page.clientHeight;return {left:w*.096,top:h*.09,right:w*.91,bottom:h*.90}}
 function facsimileConstrain(el,page){
  const b=facsimileBounds(page),maxW=b.right-b.left;
  if(el.offsetWidth>maxW)el.style.width=(maxW/page.clientWidth*100)+'%';
  const x=Math.min(Math.max(el.offsetLeft,b.left),Math.max(b.left,b.right-el.offsetWidth));
  const y=Math.max(b.top,el.offsetTop);
  el.style.left=(x/page.clientWidth*100)+'%';
  el.style.top=(y/page.clientHeight*100)+'%';
  return y+Math.max(el.offsetHeight,el.scrollHeight)<=b.bottom;
 }
 function facsimileLayout(page){
  if(!page||page.dataset.layoutBusy==='1'||page.dataset.dragging==='1')return;
  page.dataset.layoutBusy='1';
  try{
   const b=facsimileBounds(page);
   const items=[...page.querySelectorAll('[data-block],[data-template-table]')];
   let overflow=false;
   for(const el of items){if(!facsimileConstrain(el,page))overflow=true}
   const flowing=items.filter(el=>el.dataset.flow!=='off').sort((a,b)=>Number(a.dataset.baseTop??a.offsetTop)-Number(b.dataset.baseTop??b.offsetTop));
   let bottom=b.top;
   for(const el of flowing){
    const anchor=Math.max(b.top,Number(el.dataset.baseTop??el.offsetTop));
    const y=Math.max(anchor,bottom===b.top?b.top:bottom+18);
    el.style.top=(y/page.clientHeight*100)+'%';
    bottom=y+Math.max(el.offsetHeight,el.scrollHeight);
    if(bottom>b.bottom)overflow=true;
   }
   page.classList.toggle('as-page-overflow',overflow);
   page.title=overflow?'Inhalt überschreitet den sicheren Seitenrand. Bitte auf eine weitere Seite verteilen.':'';
  }finally{page.dataset.layoutBusy='0'}
 }
 function facsimileInitEditing(){
  if(!window.__lgFacsimileKeys){document.addEventListener('keydown',facsimileKeyboard);window.__lgFacsimileKeys=true}
  const root=document.getElementById('as-facsimile');if(!root)return;
  root.addEventListener('beforeinput',e=>{
   if(e.target.closest('[contenteditable=true]')&&!root.dataset.editSnapshot){facsimileCheckpoint();root.dataset.editSnapshot='1'}
  });
  root.addEventListener('focusout',()=>{root.dataset.editSnapshot=''});
  root.querySelectorAll('[data-block],[data-template-table]').forEach(el=>{
   const page=el.closest('[data-page]');
   el.dataset.baseTop=String(el.offsetTop);
   el.dataset.flow=el.dataset.flow||'on';
   el.style.resize='both';el.style.minWidth='45px';el.style.minHeight='24px';
   // Keep the drag handle INSIDE the box; negative top was clipped by the A4 page.
   const handle=document.createElement('button');handle.type='button';handle.className='as-drag-handle as-edit-only';
   handle.textContent='⠿';handle.title='Element ziehen und verschieben';handle.contentEditable='false';
   el.prepend(handle);
   const resizer=document.createElement('button');resizer.type='button';resizer.className='as-resize-grip as-edit-only';resizer.textContent='↘';resizer.title='Breite und Höhe mit der Maus verändern';resizer.contentEditable='false';el.append(resizer);
   resizer.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;e.preventDefault();e.stopPropagation();facsimileCheckpoint();facsimileSelect(el);
    const sx=e.clientX,sy=e.clientY,rect=page.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight,b=facsimileBounds(page);
    page.dataset.dragging='1';
    const move=ev=>{
     const dx=(ev.clientX-sx)*page.clientWidth/rect.width,dy=(ev.clientY-sy)*page.clientHeight/rect.height;
     const maxWidth=Math.max(45,b.right-el.offsetLeft),maxHeight=Math.max(24,b.bottom-el.offsetTop);
     el.style.width=(Math.min(maxWidth,Math.max(45,w+dx))/page.clientWidth*100)+'%';
     el.style.height=(Math.min(maxHeight,Math.max(24,h+dy))/page.clientHeight*100)+'%';dirty=true;
    };
    const stop=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',stop);document.removeEventListener('pointercancel',stop);page.dataset.dragging='0';facsimileLayout(page)};
    document.addEventListener('pointermove',move);document.addEventListener('pointerup',stop);document.addEventListener('pointercancel',stop);
   });
   handle.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    e.preventDefault();e.stopPropagation();
    facsimileCheckpoint();facsimileSelect(el);
    const box=page.getBoundingClientRect(),startX=e.clientX,startY=e.clientY;
    const initialX=el.offsetLeft,initialY=el.offsetTop;
    const bounds=facsimileBounds(page);
    page.dataset.dragging='1';
    const move=ev=>{
     ev.preventDefault();
     const dx=(ev.clientX-startX)*page.clientWidth/box.width;
     const dy=(ev.clientY-startY)*page.clientHeight/box.height;
     const x=Math.max(bounds.left,Math.min(bounds.right-el.offsetWidth,initialX+dx));
     const y=Math.max(bounds.top,Math.min(bounds.bottom-el.offsetHeight,initialY+dy));
     el.style.left=(x/page.clientWidth*100)+'%';el.style.top=(y/page.clientHeight*100)+'%';
     dirty=true;
    };
    const stop=()=>{
     document.removeEventListener('pointermove',move);
     document.removeEventListener('pointerup',stop);
     document.removeEventListener('pointercancel',stop);
     page.dataset.dragging='0';
     el.dataset.baseTop=String(el.offsetTop);
     // Manually placed elements stay where dropped; other flowing blocks reflow.
     el.dataset.flow='off';
     facsimileLayout(page);
    };
    document.addEventListener('pointermove',move);
    document.addEventListener('pointerup',stop);
    document.addEventListener('pointercancel',stop);
   });
   el.addEventListener('pointerdown',e=>{if(e.target.closest('button,.as-drag-handle'))return;facsimileSelect(e.target.closest('td,th')||el,e.ctrlKey||e.metaKey||e.shiftKey)});
   el.addEventListener('input',()=>{dirty=true;facsimileLayout(page)});
   el.addEventListener('pointerup',()=>{dirty=true;facsimileLayout(page)});
   if(typeof ResizeObserver!=='undefined'){
    const ro=new ResizeObserver(()=>{if(!el.isConnected||page.dataset.layoutBusy==='1'||page.dataset.dragging==='1')return;dirty=true;facsimileLayout(page)});
    ro.observe(el);
   }
  });
  root.querySelectorAll('.as-facsimile-page').forEach(facsimileLayout);
 }
 function facsimilePage(){facsimileCheckpoint();const d=collectFacsimile();d.studioFacsimilePages.push([]);open(d.id);dirty=true}
 function facsimileNewBlock(){facsimileCheckpoint();const d=collectFacsimile(),n=Number(prompt('Auf welcher Seite (1–'+d.studioFacsimilePages.length+')?','1'));if(!Number.isInteger(n)||n<1||n>d.studioFacsimilePages.length)return;d.studioFacsimilePages[n-1].push({x:57,y:400,w:380,h:35,text:'Neuer Text',size:10,bold:false,flow:true});open(d.id);dirty=true}

 function facsimilePageDelete(){facsimileCheckpoint();const d=collectFacsimile();if(d.studioFacsimilePages.length<=1)return alert('Mindestens eine Seite muss bleiben.');const n=Number(prompt('Welche Seite löschen? (1–'+d.studioFacsimilePages.length+')',String(d.studioFacsimilePages.length)));if(!Number.isInteger(n)||n<1||n>d.studioFacsimilePages.length)return;if(!confirm('Seite '+n+' samt Text und Tabellen wirklich löschen?'))return;d.studioFacsimilePages.splice(n-1,1);d.studioTemplateTables=(d.studioTemplateTables||[]).filter(t=>t.page!==n).map(t=>({...t,page:t.page>n?t.page-1:t.page}));open(d.id);dirty=true}
 function facsimileFontFamily(v){document.execCommand('fontName',false,v);dirty=true}
 function facsimileColor(v){document.execCommand('foreColor',false,v);dirty=true}
 function facsimileHighlight(v){document.execCommand('hiliteColor',false,v);dirty=true}
 function facsimileSpacing(v){const sel=window.getSelection(),el=sel?.anchorNode?.parentElement?.closest?.('[data-block],td,th');if(!el)return alert('Zuerst ein Textfeld oder eine Tabellenzelle anklicken.');el.style.lineHeight=String(v);dirty=true}
 function facsimileAlign(v){document.execCommand(v,false,null);dirty=true}
 function facsimileTableStyle(){const d=collectFacsimile(),n=Number(prompt('Tabellennummer (1–'+d.studioTemplateTables.length+')','1'))-1,t=d.studioTemplateTables[n];if(!t)return;const kind=prompt('Tabellenart: free (frei), calc (Berechnung), extra (Zusatzkosten), rates (Sätze), lph (Leistungsphasen)',t.kind||'free');if(!['free','calc','extra','rates','lph'].includes(kind))return alert('Unbekannte Tabellenart');t.kind=kind;open(d.id);dirty=true}
 function facsimileCellFormula(){const sel=window.getSelection(),cell=sel?.anchorNode?.parentElement?.closest?.('[data-tr][data-td]');if(!cell)return alert('Zuerst die Ergebniszelle anklicken.');const wrap=cell.closest('[data-template-table]'),i=Number(wrap.dataset.templateTable),r=Number(cell.dataset.tr),c=Number(cell.dataset.td),d=collectFacsimile(),t=d.studioTemplateTables[i];const input=prompt('Formel: =SUM(A1:A5), =A1*B1, =A1+B1, =A1*9% oder =46850*9%',t.formulas?.[r+','+c]||'=');if(input===null)return;const formula=input.trim();if(!formula.startsWith('='))return alert('Formel muss mit = beginnen.');t.formulas=t.formulas||{};t.formulas[r+','+c]=formula;try{t.rows[r][c]=computeCell(t,formula,r,c)+' €'}catch(e){return alert('Formelfehler: '+e.message)}open(d.id);dirty=true}
 function computeCell(t,formula,targetR,targetC){const val=x=>{const cleaned=String(x).replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',','.');return Number(cleaned)||0};const ref=x=>{const m=x.match(/^([A-Z]+)([1-9]\d*)$/i);if(!m)throw Error('Ungültige Zelladresse '+x);let col=0;for(const ch of m[1].toUpperCase())col=col*26+ch.charCodeAt(0)-64;const r=Number(m[2])-1,c=col-1;if(r===targetR&&c===targetC)throw Error('Zirkelbezug');return val(t.rows[r]?.[c]||'0')};let f=formula.slice(1).toUpperCase().replace(/\s/g,'');let result;const sum=f.match(/^SUM\(([A-Z]+[1-9]\d*):([A-Z]+[1-9]\d*)\)$/);if(sum){const decode=x=>{const m=x.match(/^([A-Z]+)(\d+)$/);let c=0;for(const ch of m[1])c=c*26+ch.charCodeAt(0)-64;return [Number(m[2])-1,c-1]};const [r1,c1]=decode(sum[1]),[r2,c2]=decode(sum[2]);result=0;for(let r=Math.min(r1,r2);r<=Math.max(r1,r2);r++)for(let c=Math.min(c1,c2);c<=Math.max(c1,c2);c++){if(r===targetR&&c===targetC)throw Error('Zirkelbezug');result+=val(t.rows[r]?.[c]||'0')}}else{const tokens=f.match(/(?:[A-Z]+[1-9]\d*|\d+(?:[.,]\d+)?%?)(?:[+*\/-](?:[A-Z]+[1-9]\d*|\d+(?:[.,]\d+)?%?))*/);if(!tokens||tokens[0]!==f)throw Error('Nur +, -, *, /, SUM und Zelladressen erlaubt');const pieces=f.split(/([+*\/-])/);const numbers=pieces.map((x,i)=>i%2?x:/^[A-Z]/.test(x)?ref(x):val(x.replace('%',''))*(x.endsWith('%')?.01:1));result=numbers[0];for(let i=1;i<numbers.length;i+=2){const op=numbers[i],b=numbers[i+1];if(op==='+')result+=b;else if(op==='-')result-=b;else if(op==='*')result*=b;else if(op==='/'){if(b===0)throw Error('Division durch Null');result/=b}}}if(!Number.isFinite(result))throw Error('Ungültiges Ergebnis');return new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(result)}
 let templateCache=[],templateLoaded=false;
 function templateClient(){if(!cloudReady||!cloudClient)throw Error('Keine aktive Supabase-Verbindung. Bitte anmelden.');return cloudClient}
 async function templateFetch(){
  const {data,error}=await templateClient().from('lg_offer_templates').select('id,name,category,is_default,data').order('created_at',{ascending:true});
  if(error)throw Error(error.message);templateCache=(data||[]).map(t=>({...t,default:t.is_default}));templateLoaded=true;return templateCache;
 }
 async function templateLibrary(){
  const app=document.getElementById('app');app.innerHTML='<section class="as-shell"><h2>Vorlagenbibliothek</h2><p>Vorlagen werden aus Supabase geladen …</p></section>';
  try{await templateFetch();if(!document.getElementById('app'))return;
   const items=templateCache;app.innerHTML=`<section class="as-shell"><div class="as-head"><h2>Vorlagenbibliothek</h2><button onclick="LGStudio.back()">← Zurück</button></div><p>Vorlagen werden in Supabase gespeichert. Bestehende Angebote bleiben unverändert.</p><div class="panel">${items.length?items.map(t=>`<div style="padding:12px;border-bottom:1px solid #53657b"><b>${escape(t.name)}</b>${t.default?' · STANDARD':''}<br><small>${escape(t.category)}</small><div style="display:flex;gap:6px;margin-top:8px"><button onclick="LGStudio.templateDefault('${t.id}')">Als Standard</button><button onclick="LGStudio.templateRemove('${t.id}')">Entfernen</button></div></div>`).join(''):'Noch keine gespeicherten Vorlagen.'}</div><button onclick="LGStudio.templateImportLegacy()">Frühere lokale Vorlagen übernehmen</button></section>`;
  }catch(e){app.innerHTML=`<section class="as-shell"><h2>Vorlagenbibliothek</h2><p style="color:#ff9c9c">Supabase: ${escape(e.message)}</p><p>Bitte zuerst die SQL-Datei aus V80 ausführen. Es wurde nichts gelöscht.</p><button onclick="LGStudio.back()">Zurück</button></section>`}
 }
 async function templateSave(){
  const d=collectFacsimile(),name=prompt('Name der neuen Vorlage','Individuelles Angebot');if(!name?.trim())return;
  const category=(prompt('Bereich / Kategorie','Individuelle Angebote')||'Individuelle Angebote').trim();
  const item={id:id(),name:name.trim(),category,is_default:false,data:{studioFacsimile:true,studioFacsimilePages:JSON.parse(JSON.stringify(d.studioFacsimilePages)),studioTemplateTables:JSON.parse(JSON.stringify(d.studioTemplateTables))}};
  try{await templateFetch();item.is_default=!templateCache.some(t=>t.category===category&&t.default);
   const {error}=await templateClient().from('lg_offer_templates').insert(item);if(error)throw Error(error.message);
   await templateFetch();alert('Vorlage erfolgreich in Supabase gespeichert.');
  }catch(e){alert('Vorlage NICHT gespeichert: '+e.message+'\nBitte SQL-Migration und Berechtigungen prüfen.');}
 }
 async function templateDefault(tid){try{const {error}=await templateClient().rpc('lg_set_default_offer_template',{p_id:tid});if(error)throw Error(error.message);await templateLibrary()}catch(e){alert('Standardvorlage nicht geändert: '+e.message)}}
 async function templateRemove(tid){if(!confirm('Vorlage dauerhaft aus Supabase löschen? Bestehende Angebote bleiben erhalten.'))return;
  try{const {data,error}=await templateClient().from('lg_offer_templates').delete().eq('id',tid).select('id');if(error)throw Error(error.message);if(!data?.length)throw Error('Löschen nicht bestätigt.');await templateLibrary()}catch(e){alert('Vorlage nicht gelöscht: '+e.message)}
 }
 async function templateImportLegacy(){
  const legacy=[...(state.settings?.studioTemplates||[])];try{const saved=JSON.parse(localStorage.getItem('lg_studio_templates_backup_v1')||'[]');if(Array.isArray(saved))for(const t of saved)if(!legacy.some(x=>x.id===t.id))legacy.push(t)}catch(e){}
  if(!legacy.length)return alert('Keine früheren Vorlagen gefunden.');if(!confirm(legacy.length+' frühere Vorlagen nach Supabase übernehmen? Vorhandene Vorlagen werden nicht überschrieben.'))return;
  try{await templateFetch();let imported=0;for(const t of legacy){if(templateCache.some(x=>x.id===t.id))continue;
   const isDefault=!!t.default&&!templateCache.some(x=>x.category===(t.category||'Individuelle Angebote')&&x.default);
   const {error}=await templateClient().from('lg_offer_templates').insert({id:t.id,name:t.name,category:t.category||'Individuelle Angebote',is_default:isDefault,data:t.data});if(error)throw Error(error.message);imported++;templateCache.push({...t,default:isDefault})}
   await templateLibrary();alert(imported+' Vorlagen nach Supabase übernommen.');
  }catch(e){alert('Import unvollständig: '+e.message+'\nBisher importierte Vorlagen bleiben erhalten. Bitte erneut prüfen.')}
 }

 function facsimileExport(){return exportPdf()}

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
 #app .as-pagebreak{break-before:page;page-break-before:always} #app .as-position tr,#app .as-free-table tr{break-inside:avoid;page-break-inside:avoid}
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

 #app #as-facsimile{display:flex;flex-direction:column;align-items:center;gap:18px;background:#e9edf2;padding:20px}
 #app .as-facsimile-page{position:relative;width:210mm;height:297mm;min-width:210mm;min-height:297mm;background:#fff;color:#111;box-shadow:0 2px 12px #0003;overflow:hidden;break-after:page;page-break-after:always;font-family:Arial,Helvetica,sans-serif}
 #app .as-facsimile-block{position:absolute;white-space:pre-wrap;line-height:1.5;outline:1px dashed transparent;overflow:visible;min-height:10px;z-index:2}
 #app .as-selected{outline:2px solid #3477bb!important;outline-offset:2px} #app .as-drag-handle{font-size:12px!important;letter-spacing:0!important;line-height:1!important;opacity:.65;user-select:none!important;cursor:grab!important;white-space:nowrap!important}#app .as-facsimile-block:focus{outline:1px dashed #2c72cc;background:#f1f7ff}
 #app .as-drag-handle{position:absolute;top:-15px;left:0;background:#2d4667;color:#fff;padding:1px 9px;border-radius:5px 5px 0 0;cursor:grab;z-index:20;font-size:12px;touch-action:none;user-select:none}
 #app .as-drag-handle:active{cursor:grabbing}
 #app .as-multi-selected{outline:2px dashed #2687d9!important;outline-offset:2px}
 #app .as-template-table{overflow:visible}
 #app .as-facsimile-logo{position:absolute;right:9%;top:4%;width:25%;max-height:8%;object-fit:contain}
 #app .as-facsimile-sender{position:absolute;left:9.6%;top:15%;font-size:5pt;font-weight:bold}
 #app .as-facsimile-customer{position:absolute;left:9.6%;top:17.4%;font-size:10pt;line-height:1.65}
 #app .as-facsimile-date{position:absolute;right:9%;top:30.5%;font-size:10pt}
 #app .as-facsimile-number{position:absolute;left:9.6%;top:37.5%;font-size:10pt;font-style:italic}
 #app .as-facsimile-company{position:absolute;right:5.2%;bottom:6.2%;font-size:5.8pt;color:#777;text-align:right;line-height:1.5;z-index:1}
 #app .as-facsimile-footer{position:absolute;bottom:3.5%;left:0;right:0;text-align:center;font-size:5.5pt;color:#555}
 #app .as-template-table{position:absolute;z-index:4;font-size:8pt;background:white}#app .as-template-table table{width:100%;border-collapse:collapse}#app .as-template-table th{background:#bcbcbc;color:#111}#app .as-template-table td,#app .as-template-table th{border:1px solid #bbb;padding:4px;min-width:30px}#app .as-template-controls{display:flex;gap:4px}#app .as-template-controls button{font-size:7pt;padding:2px 4px}#app .as-template-table [contenteditable=true]:focus{outline:1px dashed #3477bb}
 #app .as-template-table{font-family:Arial,Helvetica,sans-serif;font-size:8pt;line-height:1.5;z-index:3;background:#fff}
 #app .as-template-table table{table-layout:fixed;width:100%;border-collapse:collapse}
 #app .as-template-table td,#app .as-template-table th{vertical-align:middle;overflow-wrap:break-word;white-space:pre-wrap}
 #app .as-table-lph th{background:#fff;border:1px solid #aaa;font-size:7.6pt;font-weight:bold;text-align:center}
 #app .as-table-lph td{border:1px solid #aaa;padding:3px 4px;font-size:7.5pt}
 #app .as-table-lph td:first-child{font-weight:700}
 #app .as-table-lph td:nth-child(2){white-space:pre-line}
 #app .as-table-calc{font-size:7.8pt}
 #app .as-table-calc th{background:#bcbcbc;text-align:center;border:0;padding:3px;font-size:7pt}
 #app .as-table-calc td{border:0;padding:6px 4px;font-size:8pt}
 #app .as-table-calc td:last-child{text-align:right}
 #app .as-table-calc tr:nth-last-child(4) td{border-top:1px solid #aaa;font-weight:700}
 #app .as-table-calc tr:last-child td{border-top:2px solid #333;font-weight:700}
 #app .as-table-extra th,#app .as-table-extra td{border:0!important;background:#d0d0d0;padding:5px;font-size:7.5pt}
 #app .as-table-extra th:last-child,#app .as-table-extra td:last-child{background:#fffcc4!important;text-align:right}
 #app .as-table-rates td{border:0!important;padding:3px 0;font-size:10pt}
 #app .as-table-rates td:last-child{text-align:right}
 #app .as-template-controls{position:absolute;top:-23px;right:0;display:flex;gap:2px;z-index:10;white-space:nowrap;background:#fff}
 #app .as-template-controls button{font-size:8px;padding:3px 5px;min-width:0}
 #app .as-facsimile-editor{display:grid;grid-template-columns:minmax(0,1fr) 235px;gap:16px;align-items:start}#app .as-facsimile-workspace{min-width:0;overflow:auto}#app .as-facsimile-sidebar{position:sticky;top:12px;max-height:calc(100vh - 30px);overflow:auto;padding:14px;border-radius:12px;background:#24354a;color:white;display:flex;flex-direction:column;gap:9px}#app .as-facsimile-sidebar details{border-top:1px solid #64748b;padding:8px 0}#app .as-facsimile-sidebar summary{font-weight:700;cursor:pointer;margin-bottom:8px}#app .as-facsimile-sidebar button{width:100%;margin:3px 0;padding:7px}#app .as-facsimile-sidebar label{display:block;margin:7px 0;font-size:12px}#app .as-facsimile-sidebar select,#app .as-facsimile-sidebar input{width:100%;margin-top:4px}#app .as-side-help{font-size:11px;opacity:.8}#app .as-template-table thead th{background:#bfc1c4!important;color:#111!important}@media(max-width:1100px){#app .as-facsimile-editor{grid-template-columns:1fr}#app .as-facsimile-sidebar{position:static;max-height:none}}
 #app .as-facsimile-page{overflow:hidden}
 #app .as-drag-handle{font-size:12px!important;letter-spacing:0!important;line-height:1!important;opacity:.65;user-select:none!important;cursor:grab!important;white-space:nowrap!important}#app .as-cell-multi{outline:2px solid #2985df!important;outline-offset:-2px}#app .as-page-overflow{box-shadow:0 0 0 3px #c84b4b,0 2px 12px #0003!important}#app .as-facsimile-block:focus,#app .as-template-table [contenteditable=true]:focus{outline:1px dashed #2673b8}
 #app .as-facsimile-page .as-drag-handle{position:absolute!important;left:-30px!important;top:0!important;z-index:100!important;display:block!important;width:23px!important;height:23px!important;padding:0!important;margin:0!important;border:1px solid #8295b0!important;border-radius:4px!important;background:#253c59!important;color:white!important;font-size:17px!important;line-height:20px!important;cursor:grab!important;touch-action:none!important;user-select:none!important;opacity:1!important}
 #app .as-facsimile-page .as-drag-handle:active{cursor:grabbing!important}
 #app .as-facsimile-page [data-block]{box-sizing:border-box;overflow-wrap:anywhere;overflow:visible!important}
 #app .as-facsimile-page [data-template-table]{box-sizing:border-box;max-width:81.4%;overflow:visible!important}
 #app .as-facsimile-page [data-template-table] table{max-width:100%}
 #app .as-facsimile-page .as-resize-grip{position:absolute!important;right:-13px!important;bottom:-13px!important;width:24px!important;height:24px!important;z-index:101!important;border:1px solid #8395ad!important;border-radius:5px!important;background:#253c59!important;color:#fff!important;cursor:nwse-resize!important;touch-action:none!important;line-height:20px!important;padding:0!important;font-size:16px!important;display:block!important}
 #app .as-facsimile-page .as-drag-handle{font-size:15px!important;width:25px!important;height:25px!important}
 #app .as-facsimile-page [data-block],#app .as-facsimile-page [data-template-table]{resize:none!important}
  </style>`;
 function ensureStudioStyle(){
  const old=document.getElementById('lg-studio-style');
  if(old)old.remove();
  document.head.insertAdjacentHTML('beforeend',css);
  return document.getElementById('lg-studio-style');
 }
 function page(){
  ensureStudioStyle();
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
  ensureStudioStyle();
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
   const p={id:id(),name,number,customerId:c.id,phase:'Angebotsphase',notes:''};
   state.projects.push(p);save();
   // Öffnet den Editor direkt; die Cloud-Speicherung erfolgt über den vorhandenen zentralen Save-Mechanismus.
   startInternal(p.id);
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
  const defaultTemplate=(state.settings?.studioTemplates||[]).find(t=>t.default&&t.category==='Individuelle Angebote');Object.assign(d,templateInit());pendingNewOffer=d;chooseOfferTemplate();
 }
 async function chooseOfferTemplate(){
  const d=pendingNewOffer;if(!d)return;const app=document.getElementById('app');app.innerHTML='<section class="as-shell"><h2>Vorlagen laden …</h2></section>';
  try{await templateFetch();const templates=templateCache;
   app.innerHTML=`<section class="as-shell"><div class="as-head"><h2>Vorlage für neues Angebot wählen</h2><button onclick="LGStudio.internal()">← Projekte</button></div><p>Wähle eine gespeicherte Supabase-Vorlage oder beginne leer. Bestehende Entwürfe bleiben erhalten.</p><div class="panel" style="display:grid;gap:10px"><button onclick="LGStudio.createOfferFromTemplate('')">+ Leeres Angebot (nur Pflichtangaben)</button>${templates.map(t=>`<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px;border:1px solid #53657b;border-radius:8px"><span>${escape(t.name)} · ${escape(t.category)} ${t.default?'(Standard)':''}</span><span><button onclick="LGStudio.createOfferFromTemplate('${t.id}')">Auswählen</button><button onclick="LGStudio.removeOfferTemplate('${t.id}')">Löschen</button></span></div>`).join('')}</div></section>`;
  }catch(e){app.innerHTML=`<section class="as-shell"><h2>Vorlagen konnten nicht geladen werden</h2><p>${escape(e.message)}</p><p>Führe die V80-SQL-Migration aus. Du kannst bis dahin ein leeres Angebot anlegen.</p><button onclick="LGStudio.createOfferFromTemplate('')">Leeres Angebot</button></section>`}
 }
 async function removeOfferTemplate(tid){if(!confirm('Vorlage endgültig aus Supabase löschen?'))return;try{const {data,error}=await templateClient().from('lg_offer_templates').delete().eq('id',tid).select('id');if(error)throw Error(error.message);if(!data?.length)throw Error('Löschen nicht bestätigt');await chooseOfferTemplate()}catch(e){alert(e.message)}}
 function createOfferFromTemplate(tid){
  const d=pendingNewOffer;if(!d)return;
  if(tid){const t=templateCache.find(x=>x.id===tid);if(!t)return alert('Vorlage nicht gefunden');Object.assign(d,JSON.parse(JSON.stringify(t.data)))}
  else Object.assign(d,{studioFacsimile:true,studioFacsimilePages:[[]],studioTemplateTables:[]});
  pendingNewOffer=null, selectedBlocks=new Set(), historyPast=[], historyFuture=[], historyDoc=null, historyRestoring=false;state.docs.push(d);save();open(d.id)
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
  return (d.studioFreeTables||[]).map((t,i)=>`<section class="as-free-block" data-free="${i}"><div class="as-free-controls as-edit-only">${ro?'':`<button onclick="LGStudio.freeRow(${i})">+ Zeile</button><button onclick="LGStudio.freeCol(${i})">+ Spalte</button><button onclick="LGStudio.freeWidth(${i})">Spaltenbreite</button><button onclick="LGStudio.freeMerge(${i})">Zellen verbinden</button><button onclick="LGStudio.freeUnmerge(${i})">Verbindung lösen</button><button onclick="LGStudio.freeRemove(${i})">Entfernen</button>`}</div><table class="as-free-table" style="table-layout:fixed"><colgroup>${(t.widths||t.cells[0].map(()=>100/t.cells[0].length)).map(w=>`<col style="width:${Number(w)}%">`).join('')}</colgroup><tbody>${(t.cells||[]).map((row,r)=>`<tr>${row.map((cell,c)=>{const v=typeof cell==='object'?cell:{text:cell};return v.hidden?'':`<${r===0?'th':'td'} contenteditable="${!ro}" data-r="${r}" data-c="${c}" colspan="${v.colspan||1}">${escape(v.text||'')}</${r===0?'th':'td'}>`}).join('')}</tr>`).join('')}</tbody></table></section>`).join('');
 }
 function freeAdd(){const d=collect();d.studioFreeTables=d.studioFreeTables||[];d.studioFreeTables.push({cells:[['Spalte 1','Spalte 2'],['','']],widths:[50,50]});open(d.id);dirty=true}
 function freeRow(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;t.cells.push(Array(t.cells[0].length).fill(''));open(d.id);dirty=true}
 function freeCol(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;t.cells.forEach(r=>r.push(''));t.widths=Array(t.cells[0].length).fill(100/t.cells[0].length);open(d.id);dirty=true}
 function freeWidth(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;const input=prompt('Spaltenbreiten in Prozent, durch Kommas getrennt (z. B. 30,70)',(t.widths||[]).join(','));if(input===null)return;const widths=input.split(',').map(Number);if(widths.length!==t.cells[0].length||widths.some(w=>!Number.isFinite(w)||w<=0)||Math.abs(widths.reduce((a,b)=>a+b,0)-100)>0.01)return alert('Bitte für jede Spalte einen positiven Prozentwert eingeben; Summe 100.');t.widths=widths;open(d.id);dirty=true}
 function freeMerge(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;const r=Number(prompt('Zeile verbinden (1 = Kopfzeile):','1'))-1;if(!Number.isInteger(r)||r<0||r>=t.cells.length)return alert('Ungültige Zeile.');const start=Number(prompt('Ab Spalte (1-basiert):','1'))-1;const count=Number(prompt('Wie viele Spalten verbinden?','2'));if(!Number.isInteger(start)||!Number.isInteger(count)||start<0||count<2||start+count>t.cells[r].length)return alert('Ungültiger Bereich.');const row=t.cells[r];if(row.slice(start,start+count).some(c=>typeof c==='object'&&(c.hidden||c.colspan>1)))return alert('Bereich enthält bereits verbundene Zellen.');row[start]={text:row.slice(start,start+count).map(c=>typeof c==='object'?c.text:c).filter(Boolean).join(' '),colspan:count};for(let c=start+1;c<start+count;c++)row[c]={text:'',hidden:true};open(d.id);dirty=true}
 function freeUnmerge(i){const d=collect(),t=d.studioFreeTables[i];if(!t)return;const r=Number(prompt('Zeile (1-basiert):','1'))-1;if(!Number.isInteger(r)||r<0||r>=t.cells.length)return alert('Ungültige Zeile.');t.cells[r]=t.cells[r].map(c=>typeof c==='object'?c.text||'':c);open(d.id);dirty=true}
 function freeRemove(i){if(!confirm('Freie Tabelle entfernen?'))return;const d=collect();d.studioFreeTables.splice(i,1);open(d.id);dirty=true}
 function calcAdd(){const d=collect();d.studioCalcGroups=d.studioCalcGroups||[];d.studioCalcGroups.push({title:'Weitere Kalkulation',lines:[{id:id(),description:'',qty:1,price:0,discount:0,percent:100}]});open(d.id);dirty=true}
 function calcRemove(i){if(!confirm('Diese Kalkulationstabelle entfernen?'))return;const d=collect();d.studioCalcGroups.splice(i,1);open(d.id);dirty=true}
 function calcGroups(d,ro){return (d.studioCalcGroups||[]).map((g,i)=>`<section data-calc="${i}"><h3 contenteditable="${!ro}" data-calc-title>${escape(g.title||'Weitere Kalkulation')}</h3>${ro?'':`<button class="as-edit-only" onclick="LGStudio.calcLine(${i})">+ Position</button><button class="as-edit-only danger" onclick="LGStudio.calcRemove(${i})">Tabelle entfernen</button>`}<table class="as-position"><thead><tr>${calcHeaders(d,ro)}</tr></thead><tbody class="as-extra-lines">${lineRows({lines:g.lines},ro)}</tbody></table></section>`).join('')}
 function calcLine(i){const d=collect();d.studioCalcGroups[i].lines.push({id:id(),description:'',qty:1,price:0,discount:0,percent:100});open(d.id);dirty=true}
 function lineRows(d,readonly){
  return (d.lines||[]).map((l,i)=>`<tr data-line="${i}"><td>${i+1}</td><td><input aria-label="Beschreibung" data-key="description" value="${escape(l.description)}" ${readonly?'disabled':''}></td><td><input aria-label="Menge" type="number" min="0" step="0.01" data-key="qty" value="${Number(l.qty||0)}" ${readonly?'disabled':''}></td><td><input aria-label="Einzelpreis" type="number" min="0" step="0.01" data-key="price" value="${Number(l.price||0)}" ${readonly?'disabled':''}></td><td><input aria-label="Rabatt" type="number" min="0" max="100" step="0.01" data-key="discount" value="${Number(l.discount||0)}" ${readonly?'disabled':''}></td><td>${eur(Number(l.qty||0)*Number(l.price||0)*(1-Number(l.discount||0)/100))}</td><td>${readonly?'':`<button class="danger" onclick="LGStudio.removeLine(${i})">×</button>`}</td></tr>`).join('');
 }
 function open(did){
  ensureStudioStyle();
  const d=doc(did);if(!isStudio(d))return alert('Angebotsstudio-Dokument nicht gefunden.');
  if(historyDoc!==did){historyDoc=did;historyPast=[];historyFuture=[];selectedBlocks.clear()}current=did;dirty=false;if(d.external){openExternal(d);return}const ro=locked(d),c=cust(d.customerId)||{};if(d.studioFacsimile){const app=document.getElementById('app');app.innerHTML=`<section class="as-shell"><div class="as-head"><h2>Individuelles Angebot · ${escape(d.number||'Entwurf')}</h2><div class="as-actions"><button onclick="LGStudio.back()">← Übersicht</button><button onclick="LGStudio.exportPdf()">PDF</button><button onclick="LGStudio.templateLibrary()">Vorlagenbibliothek</button>${ro?'':`<button onclick="LGStudio.saveDraft()">Speichern</button><button onclick="LGStudio.release()">Freigeben</button>`}</div></div><div class="as-meta"><label>Datum<input id="as-date" type="date" value="${escape(d.date)}" ${ro?'disabled':''}></label></div><div class="as-facsimile-editor"><div class="as-facsimile-workspace">${facsimile(d,ro)}</div>${ro?'':`<aside class="as-facsimile-sidebar"><h3>Werkzeuge</h3><details open><summary>Seiten & Vorlagen</summary><button onclick="LGStudio.facsimilePage()">+ Seite</button><button onclick="LGStudio.facsimilePageDelete()">Seite löschen</button><button onclick="LGStudio.templateSave()">Als Vorlage speichern</button><button onclick="LGStudio.templateLibrary()">Vorlagenbibliothek</button></details><details open><summary>Text & Absatz</summary><button onclick="LGStudio.facsimileUndo()">↶ Rückgängig</button><button onclick="LGStudio.facsimileRedo()">↷ Wiederholen</button><button onclick="LGStudio.facsimileNewBlock()">+ Textfeld</button><button onclick="LGStudio.facsimileDeleteSelected()">Ausgewählte Textfelder löschen</button><p class="as-side-help">Cmd/Strg + Klick: mehrere Textfelder auswählen. Entf: löschen. Cmd/Strg + Z: rückgängig.</p><span>Textfluss: <b id="as-flow-status">An</b></span><button onclick="LGStudio.facsimileFlow()">Textfluss an/aus</button><p class="as-side-help">Textfelder und Tabellen am unteren rechten Rand ziehen, um die Größe zu ändern.</p><button onclick="LGStudio.facsimileFormat('bold')"><b>Fett</b></button><button onclick="LGStudio.facsimileFormat('italic')"><i>Kursiv</i></button><button onclick="LGStudio.facsimileFormat('underline')"><u>Unterstreichen</u></button><button onclick="LGStudio.facsimileFormat('insertUnorderedList')">Aufzählung</button><label>Schriftgröße (pt)<input type="number" min="5" max="96" step="0.5" value="10" onchange="LGStudio.facsimileFont(this.value)"></label><label>Schriftart<select onchange="LGStudio.facsimileFontFamily(this.value)"><option>Arial</option><option>Helvetica</option><option>Georgia</option><option>Times New Roman</option><option>Verdana</option></select></label><label>Schriftfarbe<input type="color" onchange="LGStudio.facsimileColor(this.value)"></label><label>Hervorhebung<input type="color" value="#ffff99" onchange="LGStudio.facsimileHighlight(this.value)"></label><label>Zeilenabstand<select onchange="LGStudio.facsimileSpacing(this.value)"><option value="1">1,0</option><option value="1.15" selected>1,15</option><option value="1.5">1,5</option><option value="2">2,0</option></select></label><button onclick="LGStudio.facsimileAlign('justifyLeft')">Linksbündig</button><button onclick="LGStudio.facsimileAlign('justifyCenter')">Zentriert</button><button onclick="LGStudio.facsimileAlign('justifyRight')">Rechtsbündig</button></details><details open><summary>Tabellen & Rechnen</summary><button onclick="LGStudio.facsimileTableAdd()">+ Tabelle</button><button onclick="LGStudio.facsimileTableStyle()">Tabellenart festlegen</button><button onclick="LGStudio.facsimileCellFormula()">Zellformel (=)</button><label>Zellhintergrund <input id="as-cell-bg-picker" type="color" value="#ffffff" oninput="LGStudio.facsimileApplyCellColor('bg',this.value)"></label><label>Zellschriftfarbe <input id="as-cell-text-picker" type="color" value="#111111" oninput="LGStudio.facsimileApplyCellColor('text',this.value)"></label><p class="as-side-help">Tabellenkopf grau. Tabellen direkt anklicken für Zeilen, Spalten und Breiten.</p></details></aside>`}</div></section>`;app.querySelectorAll('[data-block],[data-template-table]').forEach(e=>e.addEventListener('input',()=>{dirty=true}));facsimileInitEditing();app.querySelector('#as-date')?.addEventListener('change',()=>{dirty=true;collectFacsimile();open(d.id)});return;}
  const app=document.getElementById('app');
  app.innerHTML=`<section class="as-shell"><div class="as-head"><div><h2>${d.type==='Q'?'Individuelles Angebot':'Auftragsbestätigung'} · ${escape(d.number||'Entwurf')}</h2><p class="muted">${escape(c.name||'Kunde')} · ${ro?'Freigegeben – schreibgeschützt':'Bearbeitbarer Entwurf'}</p></div><div class="as-actions"><button class="secondary" onclick="LGStudio.back()">← Übersicht</button><button class="secondary" onclick="LGStudio.exportPdf()">PDF herunterladen</button>${ro?'':`<button onclick="LGStudio.saveDraft()">Entwurf speichern</button><button onclick="LGStudio.release()">Freigeben</button>`}${ro&&d.type==='Q'?`<button onclick="LGStudio.order('${d.id}')">In Auftrag übernehmen</button>`:''}${ro?`<button onclick="LGStudio.invoice('${d.id}')">Rechnung erstellen</button>`:''}</div></div>
  <p class="as-message">Briefkopf, Kundenadresse und Fußbereich sind gesperrt. Zusätzliche Tabellen und Formatierungen können in den Textfeldern frei eingefügt werden. Die Positionstabelle bleibt für Rechnungen strukturiert.</p>
  <div class="as-meta"><div><label>Dokumentdatum</label><input id="as-date" type="date" value="${escape(d.date)}" ${ro?'disabled':''}></div><div><label>Mehrwertsteuer (%)</label><input id="as-vat" type="number" min="0" max="100" value="${Number(d.vat??19)}" ${ro?'disabled':''}></div><div><label>Dokumentnummer</label><input value="${escape(d.number||'Wird bei Freigabe vergeben')}" disabled></div></div>
  <div class="as-editor-layout"><div class="as-editor-document">
  <div id="as-paper" class="as-canvas"><div class="as-lock"><div class="as-address">${escape(c.name)}\n${escape(c.address||'Keine Rechnungsadresse hinterlegt')}</div><img alt="Die Lichtgestalter Logo" src="${LOGO}"></div>
  <h2>${d.type==='Q'?'Angebot':'Auftragsbestätigung'} Nr. ${escape(d.number||'Entwurf')}</h2><p><b>Projekt Nr. ${escape(proj(d.projectId)?.number||proj(d.projectId)?.projectNumber||'—')}</b></p><p style="text-align:right">Datum: ${escape(d.date)}</p>
  <div id="as-top" class="as-body" contenteditable="${!ro}" spellcheck="true">${cleanHtml(d.studioTop||initial())}</div>
  <h3>Positionen</h3><table class="as-position"><thead><tr>${calcHeaders(d,ro)}</tr></thead><tbody id="as-lines">${lineRows(d,ro)}</tbody></table>
  <div id="as-extra-calc">${calcGroups(d,ro)}</div><div class="as-money">Netto: <span id="as-total">${eur(amount(d))}</span></div>
  <div id="as-free-tables">${freeTables(d,ro)}</div><div id="as-bottom" class="as-body" contenteditable="${!ro}" spellcheck="true">${cleanHtml(d.studioBottom||'<p><br></p>')}</div>
  <div class="as-protected">${escape(state.settings.company||'Die Lichtgestalter')}<br>${escape(state.settings.address||'')}<br>${escape(state.settings.email||'')}</div></div></div>
  ${!ro?`<div class="as-tools"><button onclick="LGStudio.format('bold')"><b>Fett</b></button><button onclick="LGStudio.format('italic')"><i>Kursiv</i></button><button onclick="LGStudio.format('underline')"><u>Unterstrichen</u></button><button onclick="LGStudio.format('insertUnorderedList')">Liste</button><button onclick="LGStudio.heading()">Überschrift</button><button onclick="LGStudio.table()">+ Zusatztabelle</button><button onclick="LGStudio.image()">+ Bild</button><button onclick="LGStudio.line()">+ Kalkulationsposition</button><button onclick="LGStudio.freeAdd()">+ Freie Tabelle</button><button onclick="LGStudio.calcAdd()">+ Kalkulationstabelle</button><button onclick="LGStudio.pageBreak()">+ Seitenumbruch</button></div>`:''}
</div></div></section>`;
  if(!ro){
   for(const e of app.querySelectorAll('#as-top,#as-bottom,#as-lines,#as-extra-calc,#as-date,#as-vat,#as-free-tables,.as-position thead'))e.addEventListener('input',()=>{dirty=true;updateTotals()});
  }
 }
 function updateTotals(){
  let sum=0;document.querySelectorAll('#as-lines tr,.as-extra-lines tr').forEach(tr=>{const v=k=>Number(tr.querySelector(`[data-key="${k}"]`)?.value||0);sum+=v('qty')*v('price')*(1-v('discount')/100);const cell=tr.children[5];if(cell)cell.textContent=eur(v('qty')*v('price')*(1-v('discount')/100))});
  const e=document.getElementById('as-total');if(e)e.textContent=eur(sum);
 }
 function collect(){
  const d=doc(current);if(!d||locked(d))throw Error('Dokument ist nicht bearbeitbar.');
  const lines=[...document.querySelectorAll('#as-lines tr')].map((tr,i)=>{const v=k=>tr.querySelector(`[data-key="${k}"]`)?.value;return {id:d.lines?.[i]?.id||id(),sku:'',description:v('description')||'',qty:Number(v('qty')),price:Number(v('price')),discount:Number(v('discount')),percent:100}});
  if(!lines.length)throw Error('Mindestens eine Position erforderlich.');
  if(lines.some(x=>!Number.isFinite(x.qty)||!Number.isFinite(x.price)||x.qty<0||x.price<0||x.discount<0||x.discount>100))throw Error('Mengen, Preise oder Rabatte sind ungültig.');
  const heads=[...document.querySelectorAll('.as-position:first-of-type [data-head]')].map(e=>e.textContent.trim());
  const free=[...document.querySelectorAll('[data-free]')].map(block=>{const i=Number(block.dataset.free),old=d.studioFreeTables?.[i]||{};const cells=(old.cells||[]).map(row=>row.map(cell=>typeof cell==='object'?{...cell}:cell));block.querySelectorAll('[data-r][data-c]').forEach(el=>{const r=Number(el.dataset.r),c=Number(el.dataset.c);if(typeof cells[r][c]==='object')cells[r][c].text=el.textContent;else cells[r][c]=el.textContent});return {cells,widths:old.widths}});
  const groups=[...document.querySelectorAll('[data-calc]')].map((block,i)=>({title:block.querySelector('[data-calc-title]').textContent,lines:[...block.querySelectorAll('.as-extra-lines tr')].map((tr,j)=>{const v=k=>tr.querySelector(`[data-key="${k}"]`)?.value;return {id:d.studioCalcGroups?.[i]?.lines?.[j]?.id||id(),description:v('description')||'',qty:Number(v('qty')),price:Number(v('price')),discount:Number(v('discount')),percent:100}})}));
  // Zusätzlich kalkulierte Positionen bleiben strukturiert und können in Rechnungen übernommen werden.
  
  Object.assign(d,{studioCalcHeadings:heads,studioFreeTables:free,studioCalcGroups:groups,studioTop:cleanHtml(document.getElementById('as-top').innerHTML),studioBottom:cleanHtml(document.getElementById('as-bottom').innerHTML),date:document.getElementById('as-date').value,vat:Number(document.getElementById('as-vat').value),lines});
  return d;
 }
 async function saveDraft(){
  try{
   const d=doc(current)?.studioFacsimile?collectFacsimile():collect();
   save(); // immediately commit draft to the existing platform state
   if(typeof lgFlush!=='function'||typeof lgWaitForSavedDoc!=='function')throw Error('Cloud-Synchronisierung ist nicht verfügbar. Entwurf bleibt im aktuellen Browserzustand.');
   await Promise.race([ (async()=>{await lgFlush();await lgWaitForSavedDoc(d.id)})(), new Promise((_,reject)=>setTimeout(()=>reject(new Error('Supabase-Speicherung nach 20 Sekunden nicht bestätigt.')),20000))]);
   dirty=false;alert('Entwurf gespeichert und mit Supabase synchronisiert.');open(d.id);
  }catch(e){dirty=true;alert('Speichern nicht bestätigt: '+e.message+'\nBitte diese Seite nicht schließen, bevor die Speicherung erfolgreich ist.');}
 }
 async function release(){
  try{const d=doc(current)?.studioFacsimile?collectFacsimile():collect();if(!confirm('Angebot verbindlich freigeben? Danach ist es schreibgeschützt.'))return;
   if(d.studioCalcGroups?.length){d.lines=[...d.lines,...d.studioCalcGroups.flatMap(g=>g.lines.map(l=>({...l,id:l.id||id()})))];d.studioCalcGroups=[];}
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
 function pageBreak(){const e=activeEditor();e.focus();document.execCommand('insertHTML',false,'<div class="as-pagebreak" style="break-before:page;page-break-before:always"><hr></div><p><br></p>');dirty=true}
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
  const inv={id:id(),type:'I',number:'',approvalState:'draft',status:'Entwurf',customerId:d.customerId,projectId:d.projectId||'',date:today(),vat:d.vat,sourceId:d.id,quoteId:d.type==='Q'?d.id:'',orderId:d.type==='C'?d.id:'',invoiceKind:'Schlussrechnung',lines:[...d.lines,...(d.studioCalcGroups||[]).flatMap(g=>g.lines)].map(l=>({...l,id:id(),percent:100})),notes:'',introText:'',outroText:'',payment:'Zahlbar sofort ohne Abzug',deliveryTerm:'',serviceDate:''};
  state.docs.push(inv);save();window.LGPlatform.open('Rechnungen & Gutschriften');documentForm(inv.id,'I');
 }
 async function exportPdf(){
  if(!window.html2pdf)return alert('PDF-Bibliothek konnte nicht geladen werden.');
  const d=doc(current);if(!d)return;
  if(!locked(d)&&dirty){alert('Bitte zuerst den Entwurf speichern.');return}
  const source=document.getElementById('as-facsimile')||document.getElementById('as-paper');const clone=source.cloneNode(true);
  clone.querySelectorAll('input').forEach(input=>{const t=document.createElement('span');t.textContent=input.value;input.replaceWith(t)});
  clone.querySelectorAll('button,.as-template-controls,.as-drag-handle,.as-resize-grip').forEach(b=>b.remove());clone.querySelectorAll('.as-facsimile-page').forEach(p=>{p.style.overflow='hidden';p.style.boxShadow='none'});
  clone.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
  clone.style.cssText= d.studioFacsimile?'background:white;color:#111;width:210mm;max-width:210mm;padding:0;margin:0;font-family:Arial,sans-serif':'background:white;color:#111;width:190mm;max-width:190mm;min-height:auto;padding:12mm;font-family:Arial,sans-serif';
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;z-index:-1';host.appendChild(clone);document.body.appendChild(host);
  try{
   clone.querySelectorAll('.as-edit-only').forEach(x=>x.remove());
   clone.querySelectorAll('.as-free-controls').forEach(x=>x.remove());
   if(!d.studioFacsimile){clone.style.paddingTop='27mm';clone.style.paddingBottom='24mm';}
   const pdf=await html2pdf().set({margin:d.studioFacsimile?0:[20,9,21,9],filename:(d.number||'Angebotsentwurf')+'.pdf',image:{type:'jpeg',quality:.97},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy']}}).from(clone).toPdf().get('pdf');
   const pages=pdf.internal.getNumberOfPages();
   for(let i=1;i<=pages;i++){if(d.studioFacsimile)continue;
    pdf.setPage(i);pdf.setFontSize(8);pdf.setTextColor(100);
    pdf.text(String(i)+' / '+pages,105,287,{align:'center'});
    const firm=String(state.settings.company||'Die Lichtgestalter');pdf.text(firm,197,271,{align:'right'});
    const address=String(state.settings.address||'').split('\n').slice(0,3);address.forEach((line,j)=>pdf.text(line,197,275+j*3.5,{align:'right'}));
    try{const img=document.querySelector('#as-paper .as-lock img');if(img?.complete&&img.naturalWidth){const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext('2d').drawImage(img,0,0);pdf.addImage(cv.toDataURL('image/png'),'PNG',158,7,38,Math.min(17,38*cv.height/cv.width));}}catch(_){}
   }
   pdf.save((d.number||'Angebotsentwurf')+'.pdf');
  }
  catch(e){alert('PDF-Erstellung fehlgeschlagen: '+e.message)}finally{host.remove()}
 }
 return {templateImportLegacy,facsimileUndo,facsimileRedo,facsimileDeleteSelected,chooseOfferTemplate,createOfferFromTemplate,removeOfferTemplate,facsimileMove,facsimileDeleteBlock,facsimileFlow,facsimileCellColors,facsimileApplyCellColor,page,retryNumber,templateLibrary,templateSave,templateDefault,templateRemove,facsimilePageDelete,facsimileFontFamily,facsimileColor,facsimileHighlight,facsimileSpacing,facsimileAlign,facsimileTableStyle,facsimileCellFormula,newQuote,facsimileNewBlock,facsimileTableAdd,facsimileTableRow,facsimileTableCol,facsimileTableDelete,facsimileTableWidth,facsimileTableCalc,facsimileFormat,facsimileFont,facsimilePage,freeAdd,freeRow,freeCol,freeRemove,freeWidth,freeMerge,freeUnmerge,calcAdd,calcRemove,calcLine,pageBreak,internal,startInternal,external,deleteDraft,downloadExternal,replaceExternal,releaseExternal,manualDoc,open,saveDraft,release,back,format,heading,table,image,line,removeLine,order,invoice,exportPdf};
})();
