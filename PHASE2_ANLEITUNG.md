# Phase 2B – Startseite mit drei Kacheln

## Installation
Alle Dateien aus diesem Paket in das Stammverzeichnis des GitHub-Repositories hochladen. Insbesondere `index.html`, `platform.js`, `liquiditaet.html`, `cloud.js`, `config.js`, `upgrade.js`, `pdf-download.js` und `logo.png`. Alte `finance-integration.js` nicht mehr verwenden.

Nach dem Login erscheinen drei Kacheln: Kundendaten, Dokumente, Finanzdaten. Die Liquiditäts-App verwendet die Auth-Sitzung und die `fin_`-Tabellen desselben Supabase-Projekts.

## Einschränkungen / Sicherheit
- Finanz-App ist im ersten Schritt in die Plattform eingebettet, nicht vollständig in ein einheitliches Komponentenmodell umgebaut.
- Die automatische Erzeugung wiederkehrender Buchungen und Kreditraten ist vorübergehend deaktiviert, weil das bisherige Schema bei Krediten ungültige `recurrence_id`-Referenzen erzeugen kann und sonst Doppelbuchungen drohen. Bestehende Einträge sind weiterhin sichtbar und bearbeitbar.
- Finanzbuchungen und Dokumente sind noch nicht über Kunden-IDs miteinander verbunden.
- Die Supabase-RLS-Policies müssen individuelle Admin-Berechtigungen erzwingen; reine Firmen-Domain genügt nicht.
- Vor produktiver Nutzung im Testsystem prüfen: Anmeldung, Kunden, Angebote, Finanzdaten, Teilzahlungen, Kredite, Speichern, Archiv, PDF.
- Die Daten werden nicht durch die ZIP hochgeladen; sie müssen bereits in `fin_*` vorhanden sein.
